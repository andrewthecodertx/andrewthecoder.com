#!/usr/bin/env python3
"""Nginx access log analyzer for andrewthecoder.com.

Parses the combined log format, separates bots from humans, and reports
traffic patterns, popular pages, referrers, and visitor timelines.

Usage:
    python3 tools/logalyzer.py [options]

Requires SSH access to pull logs from the production server. If no local
log file exists, it will attempt to fetch one automatically.
"""

import argparse
import gzip
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse

# -- Nginx combined log format regex -----------------------------------------
LOG_RE = re.compile(
    r'^(?P<ip>\S+)\s+\S+\s+\S+\s+'
    r'\[(?P<time>[^\]]+)\]\s+'
    r'"(?P<method>\S+)\s+(?P<path>\S+)\s+\S+"\s+'
    r'(?P<status>\d{3})\s+(?P<size>\d+)\s+'
    r'"(?P<referer>[^"]*)"\s+'
    r'"(?P<ua>[^"]*)"'
)

# -- Bot user-agent patterns (handles 95%+ of bot traffic) -------------------
BOT_UA_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r'bot\b', r'crawl', r'spider', r'slurp', r'mediapartners',
        r'\bGoogle\b', r'bingbot', r'Baiduspider', r'YandexBot',
        r'DuckDuckBot', r'archive\.org', r'ia_archiver',
        r'facebookexternalhit', r'Facebot', r'Twitterbot',
        r'LinkedInBot', r'MJ12bot', r'AhrefsBot', r'SemrushBot',
        r'dotbot', r'UptimeRobot', r'Peterman', r'HeadlessChrome',
        r'python-requests', r'python-urllib', r'python-httpx',
        r'curl/', r'wget/', r'libredtail',
        r'Go-http-client', r'Java/', r'http\.client', r'Apache-HttpClient',
        r'monitoring', r'pingdom', r'NewRelicPinger', r'Site24x7',
        r'zgrab', r'masscan', r'nmap', r'nikto', r'ScanAlert',
        r'CensysInspect', r'Fofapro', r'Zoominfo', r'Screaming Frog',
        r'SEZWhois', r'SputnikBot', r'seznam', r'Qwantify',
        r'PetalBot', r'BLEXBot', r'Mail\.RU_Bot', r'AdsBot',
        r'Rytebot', r'SemanticScholarBot', r'FaviconBot',
        r'Microsoft-DSVC', r'VelenPublic', r'Sergiobot', r'vennciov',
        r'baiduboxapp', r'OneBot', r'BrightEdge', r'GPTBot',
        r'ChatGPT', r'CCBot', r'ClaudeBot', r'PerplexityBot',
        r'Applebot', r'MojeekBot', r'Qwantbot', r'ltx71',
        r'Megaindex', r'SearchBlox', r'KonsistentBot', r'SeobilityBot',
        r'^-$',
        # Known scraper fingerprints (outdated browsers used by botnets)
        r'Firefox/47\.0',     # Win7/Firefox47 -- ancient, widely faked
        r'iPhone; CPU iPhone OS 13_',  # iOS 13 in 2025-26 — classic scraper
        r'^Mozilla/5\.0$',    # bare UA, always a bot
    ]
]

# Paths that are nearly always attack probes -- exclude from "human" counts
ATTACK_PATH_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        # Environment/secrets
        r'/\.env',                      # .env anywhere in path
        r'^/\.aws/',                    # AWS credentials
        r'^/\.git/',                    # .git/config, .git/HEAD
        # WordPress
        r'^/wp-',                      # wp-login, wp-admin, wp-content, wp-includes
        r'^/wordpress/',               # wordpress/wp-admin
        r'/wp-admin/',                  # anywhere in path
        r'/wp-content/',                # anywhere in path
        r'/wp-includes/',               # anywhere in path
        r'xmlrpc\.php',
        r'wlwmanifest\.xml',
        # PHP probes
        r'\.php$',
        r'^/phpinfo',
        r'^/info\.php',
        r'^/admin',                     # admin, admin.php, adminfuns.php
        r'^/_profiler/',                # Symfony dev profiler
        r'^/app_dev\.php',
        # Framework probes
        r'^/laravel/',
        r'^/config\.json',
        r'^/cgi-bin',
        r'^/geoserver/',
        r'^/actuator/',
        r'^/SDK/',
        r'^/webui$',
        # Cisco/network probes
        r'\+CSCOE\+/',
        r'\+CSCOL\+/',
        # Random probes
        r'^/login$',                    # brute-force login attempts
        r'^/aab\d',
        r'^/aaa\d',
        r'^/teorema\d+',
        r'^/\.well-known/(?!security\.txt)',  # well-known except security.txt
        r'^/\.well-known/security\.txt$',
        r'^/\.well-known$',
        r'^/remote/login',
        r'^/RDWeb/',
        r'^/secrets\.json',
        r'^/credentials\.json',
        r'^/config/secrets\.yml',
        r'^/sendgrid\.env',
        r'^/appsettings\.json',
        r'^/config\.js$',
        r'^/debug/default/view',         # Yii framework debug
        r'^/sitemap\.xml$',
        # More probes
        r'^/docker-compose',
        r'^/application\.(yml|properties)$',
        r'^/settings\.py$',
        r'^/terraform\.tfvars$',
        r'^/\.docker/',
        r'^/\.gitlab-ci',
        r'^/secrets\.yml$',
        r'^/server-status',
        r'^/HNAP1',
        r'/sonicos',
        r'^/swagger\.(json|yaml)$',
        r'^/ads\.txt$',
        r'^/security\.txt$',
        r'^/env(\.js)?$',
        r'^/\.vscode/',
        r'^/uploads$',
        r'^/uploads/',
        r'//cdn\.js',
        r'^/evox/',
        r'^/info$',
        r'^/test$',
        r'^/api/test$',
        # Config/secrets probes
        r'^/settings\.json$',
        r'^/env\.json$',
        r'\.npmrc$',
        r'^/web\.config$',
        r'^/appsettings\.Development',
        r'^/serverless\.yml$',
        r'^/dump\.sql$',
        r'^/terraform\.tfstate',
        r'^/config/database',
        r'^/auth\.html$',
        r'^/randkeyword',
        r'^/RDWeb',
        # More config/secret probes
        r'\.(sql|env|yml|yaml|json|ini|conf|cfg|properties)$',
        r'^/config\b',
        r'^/(backup|dump|database)\.',
        r'^/secrets',
        r'^/service-account',
        r'service-account',
        r'^/\.git-credentials',
        r'^/\.config',
        r'^/appsettings\.',
        r'^/dashboard$',
        r'^/register$',
        r'^/global-protect/',
        r'/global-protect/',
        r'^/v1/models$',
        r'/ALFA_DATA/',
        r'^/\.streamlit/',
        r'^/storage/logs/',
        r'^/\.kube/',
        r'^/sslvpn',
        r'^/env\.txt$',
        r'^/graphql$',
        r'^/index\.php/',
    ]
]

# Referrer domains that are spam
SPAM_REFERRERS = {
    'weightloss.watch', 'www.weightloss.watch',
    'semalt.com', 'buttons-for-website.com', 'best-seo-offer.com',
    'offer.wordpress.com', 'get-free-social-traffic.com',
}

# Referrer IPs that are scanner/probe traffic, not organic
SPAM_REFERRER_IPS = {
    '172.234.213.121',
}


def is_bot(ua: str) -> bool:
    """Check if user-agent is a known bot or empty."""
    return any(p.search(ua) for p in BOT_UA_PATTERNS)


def is_attack_path(path: str) -> bool:
    """Check if path matches known attack probe patterns."""
    clean = clean_path(path)
    return any(p.search(clean) for p in ATTACK_PATH_PATTERNS)


def is_spam_referrer(ref: str) -> bool:
    """Check if referrer domain is known spam or scanner origin."""
    if ref == '-' or not ref:
        return False
    domain = urlparse(ref).hostname or ref
    if domain in SPAM_REFERRERS:
        return True
    # Check if referrer is a raw IP (scanner/probe, not organic)
    if domain in SPAM_REFERRER_IPS:
        return True
    # Referrers that are IP addresses are almost always scrapers
    import socket
    try:
        socket.inet_aton(domain)
        return True
    except (OSError, ValueError):
        pass
    try:
        socket.inet_pton(socket.AF_INET6, domain)
        return True
    except (OSError, ValueError):
        pass
    return False


def parse_line(line: str) -> dict | None:
    m = LOG_RE.match(line.strip())
    if not m:
        return None
    d = m.groupdict()
    try:
        d['time'] = datetime.strptime(d['time'], '%d/%b/%Y:%H:%M:%S %z')
    except ValueError:
        return None
    d['status'] = int(d['status'])
    d['size'] = int(d['size'])
    return d


def fmt(n: int) -> str:
    """Format large numbers with K/M suffixes."""
    if n >= 1_000_000:
        return f'{n/1_000_000:.1f}M'
    if n >= 1_000:
        return f'{n/1_000:.1f}K'
    return str(n)


def fmt_pct(num: int, total: int) -> str:
    if total == 0:
        return '0%'
    return f'{num/total*100:.1f}%'


def clean_path(path: str) -> str:
    """Strip query strings and normalize path."""
    p = path.split('?')[0].split('#')[0]
    if p.endswith('/') and len(p) > 1:
        p = p.rstrip('/')
    return p if p else '/'


def page_label(path: str) -> str:
    """Human-readable label for a URL path."""
    p = clean_path(path)
    labels = {
        '/': 'Home',
        '/blog': 'Blog index',
        '/demos': 'Demos index',
        '/demos/nes': 'NES emulator',
        '/demos/conway': "Conway's Game of Life",
        '/demos/dungeon': 'Dungeon crawler',
        '/demos/mandelbrot': 'Mandelbrot viewer',
        '/about': 'About',
        '/contact': 'Contact',
        '/writing': 'Writing',
        '/uses': 'Uses',
    }
    if p in labels:
        return f'{p} ({labels[p]})'
    if p.startswith('/blog/'):
        slug = p.replace('/blog/', '')
        return f'{p} (blog: {slug})'
    if p.startswith('/demos/'):
        return f'{p} (demo)'
    return p


# -- Report sections ---------------------------------------------------------

def print_overview(human, bot, attack):
    total_human = len(human)
    total_bot = len(bot)
    total_attack = len(attack)
    total = total_human + total_bot + total_attack
    print('+------------------------------------------------------------+')
    print('|        andrewthecoder.com - Traffic Overview               |')
    print('+------------------------------------------------------------+')
    print(f'  Total requests:       {fmt(total):>10s}')
    print(f'  Human traffic:        {fmt(total_human):>10s}  ({fmt_pct(total_human, total)} of total)')
    print(f'  Bot traffic:          {fmt(total_bot):>10s}  ({fmt_pct(total_bot, total)} of total)')
    print(f'  Attack/spam:          {fmt(total_attack):>10s}  ({fmt_pct(total_attack, total)} of total)')
    if human:
        first = min(r['time'] for r in human)
        last = max(r['time'] for r in human)
        print(f'  Date range:           {first:%Y-%m-%d} to {last:%Y-%m-%d}')
        days = (last - first).days or 1
        print(f'  Avg daily (human):   {total_human // days:>6d} reqs/day')
    print()


def print_status_codes(records):
    codes = Counter(r['status'] for r in records)
    print('-- Status Codes ' + '-' * 45)
    max_count = max(codes.values())
    for code, count in codes.most_common():
        label = {
            200: 'OK', 301: 'Moved', 302: 'Found', 304: 'Not Modified',
            400: 'Bad Request', 403: 'Forbidden', 404: 'Not Found',
            405: 'Method Not Allowed', 429: 'Too Many Requests',
            500: 'Server Error', 502: 'Bad Gateway', 503: 'Unavailable',
        }.get(code, '')
        bar = '#' * min(count * 40 // max_count, 40)
        print(f'  {code} {label:<20s} {fmt(count):>7s}  {bar}')
    print()


def print_popular_pages(records, top_n=20):
    pages = Counter(clean_path(r['path']) for r in records if r['status'] == 200)
    print(f'-- Popular Pages (top {top_n}, 200s only) ' + '-' * 30)
    for i, (path, count) in enumerate(pages.most_common(top_n), 1):
        print(f'  {i:2d}. {page_label(path):<50s} {fmt(count):>7s}')
    print()


def print_top_ips(records, top_n=15):
    ip_reqs = Counter(r['ip'] for r in records)
    ip_bytes = defaultdict(int)
    for r in records:
        ip_bytes[r['ip']] += r['size']
    print(f'-- Top IPs (human traffic, top {top_n}) ' + '-' * 33)
    print(f'  {"IP":<18s} {"Requests":>9s} {"Bandwidth":>10s}')
    for ip, count in ip_reqs.most_common(top_n):
        bw = ip_bytes[ip]
        bw_str = fmt(bw) + 'B' if bw > 0 else '0'
        print(f'  {ip:<18s} {fmt(count):>9s} {bw_str:>10s}')
    print()


def print_referrers(records, top_n=15):
    referrers = Counter()
    for r in records:
        ref = r['referer']
        if ref == '-' or not ref:
            continue
        domain = urlparse(ref).hostname or ref
        if domain in ('www.andrewthecoder.com', 'andrewthecoder.com'):
            continue
        referrers[domain] += 1
    if not referrers:
        return
    print(f'-- Referrers (top {top_n}) ' + '-' * 43)
    for domain, count in referrers.most_common(top_n):
        print(f'  {domain:<50s} {fmt(count):>7s}')
    print()


def simplify_ua(ua: str) -> str:
    """Simplify a user-agent string into a readable browser/device label."""
    ua_lower = ua.lower()
    # Order matters: check most specific patterns first
    if 'firefox/' in ua_lower:
        m = re.search(r'Firefox/(\d+)', ua)
        return f'Firefox {m.group(1)}' if m else 'Firefox'
    if 'edg/' in ua_lower:
        m = re.search(r'Edg/(\d+)', ua)
        return f'Edge {m.group(1)}' if m else 'Edge'
    if 'opr/' in ua_lower or 'opera' in ua_lower:
        m = re.search(r'OPR/(\d+)', ua)
        return f'Opera {m.group(1)}' if m else 'Opera'
    if 'chrome/' in ua_lower and 'safari' in ua_lower:
        m = re.search(r'Chrome/(\d+)', ua)
        if m:
            ver = int(m.group(1))
            if 'android' in ua_lower or 'mobile' in ua_lower:
                return f'Chrome Mobile {ver}'
            return f'Chrome {ver}'
        return 'Chrome'
    if 'safari/' in ua_lower and 'chrome' not in ua_lower:
        if 'iphone' in ua_lower:
            m = re.search(r'iPhone OS (\d+[_\d]*)', ua)
            return f'Safari iOS {m.group(1).replace("_", ".")}' if m else 'Safari iOS'
        if 'ipad' in ua_lower:
            return 'Safari iPad'
        if 'macintosh' in ua_lower:
            return 'Safari Mac'
        return 'Safari'
    if 'android' in ua_lower:
        return 'Android Browser'
    if 'curl/' in ua_lower:
        return 'curl'
    if 'python' in ua_lower:
        return 'python-http'
    if 'go-http-client' in ua_lower:
        return 'Go HTTP client'
    if 'java' in ua_lower:
        return 'Java HTTP'
    if 'wget' in ua_lower:
        return 'wget'
    # Catch-all
    if len(ua) > 60:
        return ua[:57] + '...'
    return ua


def print_user_agents(records, top_n=15):
    ua_counter = Counter()
    for r in records:
        ua_counter[simplify_ua(r['ua'])] += 1
    print(f'-- User Agents (top {top_n}) ' + '-' * 40)
    for ua, count in ua_counter.most_common(top_n):
        print(f'  {fmt(count):>7s}  {ua}')
    print()


def print_daily_timeline(records):
    daily = Counter(r['time'].strftime('%Y-%m-%d') for r in records)
    max_day = max(daily.values()) if daily else 1
    print('-- Daily Request Volume ' + '-' * 40)
    for day in sorted(daily):
        bar_len = daily[day] * 50 // max_day
        bar = '#' * bar_len
        print(f'  {day}  {fmt(daily[day]):>7s}  {bar}')
    print()


def print_monthly_timeline(records):
    monthly = Counter(r['time'].strftime('%Y-%m') for r in records)
    max_m = max(monthly.values()) if monthly else 1
    print('-- Monthly Request Volume ' + '-' * 39)
    for month in sorted(monthly):
        bar_len = monthly[month] * 50 // max_m
        bar = '#' * bar_len
        print(f'  {month}  {fmt(monthly[month]):>7s}  {bar}')
    print()


def print_hourly_heatmap(records):
    hourly = Counter()
    for r in records:
        hourly[r['time'].hour] += 1
    max_h = max(hourly.values()) if hourly else 1
    print('-- Hourly Distribution (UTC) ' + '-' * 34)
    for hour in range(24):
        count = hourly.get(hour, 0)
        bar_len = count * 40 // max_h if max_h else 0
        bar = '#' * bar_len
        label = f'{hour:02d}:00'
        print(f'  {label}  {fmt(count):>7s}  {bar}')
    print()


def print_suspicious(records, top_n=10):
    """Show 4xx/5xx paths that might indicate attacks or broken links."""
    bad = [r for r in records if r['status'] >= 400]
    if not bad:
        print('-- No 4xx/5xx responses found. ' + '-' * 25)
        print()
        return
    paths = Counter((r['status'], clean_path(r['path'])) for r in bad)
    print(f'-- Suspicious / Broken Paths (top {top_n}) ' + '-' * 30)
    for (status, path), count in paths.most_common(top_n):
        print(f'  {status}  {path:<50s} {fmt(count):>7s}')
    print()


def print_attack_summary(attack_records, top_n=15):
    """Summarize attack/spam traffic separately."""
    if not attack_records:
        print('-- No attack/spam traffic detected. ' + '-' * 24)
        print()
        return
    print(f'-- Attack/Spam Summary ({fmt(len(attack_records))} requests) ' + '-' * 20)
    paths = Counter(clean_path(r['path']) for r in attack_records)
    print(f'  {"Path":<50s} {"Count":>7s}')
    for path, count in paths.most_common(top_n):
        print(f'  {path:<50s} {fmt(count):>7s}')
    # Top attacking IPs
    ips = Counter(r['ip'] for r in attack_records)
    print()
    print(f'  Top attacking IPs:')
    for ip, count in ips.most_common(10):
        print(f'    {ip:<18s} {fmt(count):>7s} requests')
    print()


def print_crawl_summary(bot_records, top_n=10):
    if not bot_records:
        print('-- No bot traffic detected. ' + '-' * 29)
        return
    bot_names = Counter()
    for r in bot_records:
        ua = r['ua'][:60]
        bot_names[ua] += 1
    print(f'-- Top Bot User-Agents (total bot requests: {fmt(len(bot_records))}) ' + '-' * 17)
    for ua, count in bot_names.most_common(top_n):
        print(f'  {fmt(count):>7s}  {ua}')
    print()


def print_geographic_hint(records, top_n=10):
    """Show top IP /24 prefixes as a rough geographic signal."""
    prefixes = Counter()
    for r in records:
        parts = r['ip'].split('.')
        prefix = '.'.join(parts[:3])
        prefixes[prefix] += 1
    print(f'-- IP /24 Clusters (top {top_n}) ' + '-' * 35)
    for prefix, count in prefixes.most_common(top_n):
        rep = next(r['ip'] for r in records if r['ip'].startswith(prefix))
        print(f'  {prefix}.x  ({rep:<15s})  {fmt(count):>7s} requests')
    print()


# -- Main --------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description='Analyze nginx access logs for andrewthecoder.com',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  logalyzer.py                  # Full report (auto-fetch log if needed)
  logalyzer.py --recent 30     # Last 30 days only, full report
  logalyzer.py --full           # Full report including daily timeline
  logalyzer.py --bots          # Bot/crawler report only
  logalyzer.py --all           # Include bots in all reports
  logalyzer.py /path/to/log   # Use specific log file
""",
    )
    parser.add_argument('logfile', nargs='?', default=None,
                        help='Path to nginx access log (local)')
    parser.add_argument('--no-fetch', action='store_true',
                        help='Do not auto-fetch log from server')
    parser.add_argument('--all', action='store_true',
                        help='Include bot traffic in all reports (default: humans only)')
    parser.add_argument('--full', action='store_true',
                        help='Show full report including daily timeline and hourly heatmap')
    parser.add_argument('--bots', action='store_true',
                        help='Show bot report only')
    parser.add_argument('--recent', type=int, metavar='DAYS',
                        help='Limit to last N days of data')
    args = parser.parse_args()

    log_path = args.logfile
    if not log_path:
        default_path = Path.home() / 'tmp' / 'andrewthecoder_com.access'
        if default_path.exists():
            log_path = str(default_path)
            print(f'Using cached log: {log_path}')
        elif not args.no_fetch:
            default_path.parent.mkdir(parents=True, exist_ok=True)
            print('Fetching log from server...')
            import subprocess
            result = subprocess.run(
                ['scp', '-i', str(Path.home() / '.ssh' / 'primekey'),
                 'andrew@erwininteractive.com:/var/log/nginx/andrewthecoder_com.access',
                 str(default_path)],
                capture_output=True, text_only=True,
            )
            if result.returncode == 0:
                log_path = str(default_path)
                print(f'Fetched log to {log_path}')
            else:
                print(f'Failed to fetch log: {result.stderr}', file=sys.stderr)
                sys.exit(1)
        else:
            print('No log file specified and --no-fetch given.', file=sys.stderr)
            sys.exit(1)

    # Parse log
    print(f'Parsing {log_path}...')
    records = []       # human traffic
    bot_records = []   # bot traffic
    attack_records = []  # attack probes (scrapers scanning for vulnerabilities)
    total_lines = 0
    parse_errors = 0

    # Time filter
    cutoff = None
    if args.recent:
        cutoff = datetime.now().astimezone() - timedelta(days=args.recent)

    open_fn = gzip.open if log_path.endswith('.gz') else open
    with open_fn(log_path, 'rt') as f:
        for line in f:
            total_lines += 1
            entry = parse_line(line)
            if entry is None:
                parse_errors += 1
                continue
            if cutoff and entry['time'] < cutoff:
                continue
            if is_bot(entry['ua']):
                bot_records.append(entry)
            elif is_attack_path(entry['path']):
                attack_records.append(entry)
            elif is_spam_referrer(entry['referer']):
                # spam referrer but not a bot UA -- still suspicious
                attack_records.append(entry)
            else:
                records.append(entry)

    if not records and not bot_records:
        print('No parseable log entries found.', file=sys.stderr)
        sys.exit(1)

    total_human = len(records)
    total_bot = len(bot_records)
    total_attack = len(attack_records)
    total_real = total_human + total_attack

    print(f'Parsed {fmt(total_lines)} lines ({fmt(parse_errors)} unparseable)')
    if cutoff:
        print(f'  Filtered to last {args.recent} days')
    print(f'  Human: {fmt(total_human)}  Bot: {fmt(total_bot)}  Attack/Spam: {fmt(total_attack)}')
    print()

    # Reports
    if args.bots:
        print_crawl_summary(bot_records)
        return

    target = records + bot_records if args.all else records

    print_overview(records, bot_records, attack_records)
    print_status_codes(target)
    print_popular_pages(target)
    if args.full or args.recent:
        print_daily_timeline(target)
    print_monthly_timeline(target)
    if args.full:
        print_hourly_heatmap(target)
    print_top_ips(target)
    print_referrers(target)
    print_user_agents(target)
    print_suspicious(target)
    print_attack_summary(attack_records)
    print_crawl_summary(bot_records)


if __name__ == '__main__':
    main()