"use strict";(()=>{function z(e,o){let a=new Array(5).fill("absent"),l=e.split("");for(let r=0;r<5;r++)o[r]===e[r]&&(a[r]="correct",l[r]=null);for(let r=0;r<5;r++){if(a[r]==="correct")continue;let t=l.indexOf(o[r]);t!==-1&&(a[r]="present",l[t]=null)}return a}function m(e,o){if(e.status!=="playing")return e;if(e.currentRow.length!==5)return{...e,message:"Not enough letters"};let a=e.currentRow.toLowerCase();if(!o.has(a))return{...e,message:"Not in word list"};let l=z(e.solution,a),r={word:a,states:l},t=[...e.guesses,r],i="playing",c="";return a===e.solution?(i="won",c=["Genius!","Magnificent!","Impressive!","Splendid!","Great!","Phew!"][Math.min(e.currentRowIdx,5)]):t.length>=6&&(i="lost",c=e.solution.toUpperCase()),{solution:e.solution,guesses:t,currentRow:"",currentRowIdx:e.currentRowIdx+1,status:i,message:c}}function h(e,o){return e.status!=="playing"||e.currentRow.length>=5?e:{...e,currentRow:e.currentRow+o}}function y(e){return e.status!=="playing"||e.currentRow.length===0?e:{...e,currentRow:e.currentRow.slice(0,-1)}}var p=["about","above","abuse","actor","acute","admit","adopt","adult","after","again","agent","agree","ahead","alarm","album","alert","alien","align","alive","allow","alone","along","alter","angel","anger","angle","angry","anime","ankle","apart","apple","apply","arena","argue","arise","armor","array","arrow","aside","asset","audio","audit","avoid","awake","award","aware","awful","babel","badge","badly","baker","basic","basin","basis","batch","beach","beard","beast","begin","being","below","bench","berry","bible","birth","black","blade","blame","bland","blank","blast","blaze","bleed","blend","bless","blind","block","blood","bloom","blown","board","boast","bonus","boost","booth","bound","brain","brand","brave","bread","break","breed","brick","brief","bring","broad","broke","brook","brown","brush","build","bunch","burst","buyer","cabin","cable","camel","candy","cargo","carry","catch","cause","cease","chain","chair","chalk","chaos","charm","chart","chase","cheap","check","cheek","cheer","chess","chest","chief","child","chunk","civic","civil","claim","clash","class","clean","clear","clerk","click","cliff","climb","cling","clock","clone","close","cloth","cloud","coach","coast","count","court","cover","crack","craft","crane","crash","crazy","cream","creek","creep","crime","crisp","cross","crowd","crown","crude","crush","curve","cycle","daily","dance","death","debug","decay","delay","delta","demon","depot","depth","derby","devil","diary","dirty","donor","doubt","dough","draft","drain","drama","drank","drawn","dream","dress","drift","drink","drive","drone","drove","dying","eager","early","earth","eight","elect","elite","ember","empty","enemy","enjoy","enter","entry","equal","error","essay","ethic","event","every","exact","exist","extra","faith","false","fancy","fatal","fault","feast","fence","fiber","field","fifth","fight","final","first","fixed","flame","flash","flesh","fleet","float","flood","floor","flour","fluid","flush","focal","focus","force","forge","forth","forum","found","frame","frank","fraud","fresh","front","frost","fruit","fully","ghost","giant","given","glass","globe","glory","glove","going","grace","grade","grain","grand","grant","graph","grasp","grass","grave","great","greed","green","greet","grief","grill","grind","gross","group","grove","grown","guard","guess","guest","guide","guilt","haven","heart","heavy","hence","hobby","honor","horse","hotel","house","human","humor","hyper","ideal","image","imply","index","indie","inner","input","issue","ivory","jewel","joker","judge","juice","juicy","knack","kneel","knife","knock","known","label","labor","lance","large","laser","later","laugh","layer","learn","lease","least","leave","legal","lemon","level","light","limit","linen","liver","local","lodge","logic","loose","lorry","lover","lower","loyal","lucky","lunar","lunch","lying","magic","major","maker","manor","maple","march","match","mayor","media","mercy","merit","metal","midst","might","minor","minus","model","money","month","moral","motor","mount","mouse","mouth","movie","music","naked","nerve","never","night","noble","noise","north","noted","novel","nurse","nylon","ocean","offer","often","olive","onset","opera","orbit","order","organ","other","ought","outer","owner","oxide","ozone","paint","panel","panic","paper","patch","pause","peace","pearl","penny","phase","phone","photo","piano","piece","pilot","pinch","pitch","pixel","pizza","place","plain","plane","plant","plate","plaza","plead","pluck","plumb","plume","plump","plunge","plunk","point","polar","posit","pound","power","press","price","pride","prime","print","prior","prize","probe","proof","prose","proud","prove","pupil","queen","quest","queue","quick","quiet","quote","radar","radio","raise","rally","range","rapid","ratio","reach","react","ready","realm","rebel","reign","relax","renew","reply","rider","ridge","rifle","right","rigid","risen","risky","rival","river","roast","robot","rocky","roman","roost","rough","round","route","rover","royal","rugby","ruler","rural","saint","salad","sauce","scale","scene","scope","score","sense","serve","setup","seven","shade","shaft","shake","shall","shame","shape","share","shark","sharp","sheep","sheer","sheet","shelf","shell","shift","shine","shirt","shock","shore","short","shout","shown","sight","sigma","since","sixth","sixty","skill","skull","slave","sleep","slice","slide","slope","small","smart","smell","smile","smoke","snake","solar","solid","solve","sorry","south","space","spare","spark","speak","speed","spend","spice","spike","spine","split","spoke","spoon","sport","spray","squad","stack","staff","stage","stain","stake","stale","stall","stamp","stand","stark","start","state","stays","steam","steel","steep","steer","stern","stick","stiff","still","stock","stone","stood","store","storm","story","stout","stove","straw","strip","stuck","study","stuff","style","sugar","suite","super","surge","swamp","swear","sweep","sweet","swift","swing","sword","swore","sworn","syrup","table","taste","teach","teeth","tempo","tense","terms","theme","thick","thief","thing","think","third","thorn","those","three","threw","throw","thumb","tiger","tight","timer","tired","title","today","token","topic","torch","total","touch","tough","tower","toxic","trace","track","trade","trail","train","trait","trash","treat","trend","trial","tribe","trick","tried","troop","truck","truly","trump","trunk","trust","truth","tumor","tuner","twice","twist","ultra","uncle","under","union","unite","unity","until","upper","upset","urban","usage","usual","utter","valid","value","valve","vault","verse","video","vigor","vinyl","viral","virus","visit","vista","vital","vivid","vocal","vodka","voice","voter","wagon","waste","watch","water","weave","wedge","weigh","weird","wheat","wheel","where","which","while","white","whole","whose","wider","witch","woman","world","worry","worse","worst","worth","would","wound","wrath","wreck","write","wrong","wrote","yacht","yield","young","youth","zebra"],S=["adieu","aider","aisle","aorta","arose","attic","audio","badge","baste","batch","beamy","beary","begat","berry","blase","bonny","bousy","braid","brace","brawn","briar","briny","brisk","broth","buxom","canny","carat","cedar","chafe","champ","chewy","chirp","choke","cigar","clair","cloche","commy","corgi","corny","coupe","coyly","crank","crepe","crick","cupid","dandy","dealt","decor","deity","demit","denim","dirac","ditto","dizzy","dodge","dowdy","dunce","eater","edict","eerie","egoism","elate","elfin","email","ember","enema","ensue","envoy","epoch","ethyl","euchar","exalt","exude","fairy","farce","fatty","fauna","femur","filer","filth","finch","fizzy","fjord","flaky","flask","flint","flora","floss","flout","fluke","foamy","foggy","foray","forge","foyer","frail","freak","freed","friar","fried","frisk","fritz","frolic","frost","froth","froze","fungi","funky","furry","fuzzy","gaily","gamma","gavel","giddy","gizmo","glare","glaze","gleam","glen","glib","glint","gloat","gloom","glory","glued","glyph","gnarly","golem","gooey","goofy","goose","gorge","gouge","gourd","gripe","grizz","grog","grout","growl","gruel","guile","guise","gulch","gully","gumbo","guppy","gusty","gypsy","hadji","hasty","hazel","heath","hefty","heist","hence","heron","hilly","hippo","homer","hooey","horde","humid","humus","hyena","igloo","impel","inept","ingot","inlay","inner","irate","ivory","jaunt","jazzy","jelly","jimmy","jolly","jumbo","jumpy","juror","kazoo","kebab","khaki","kinky","kiosk","kitty","knave","knelt","koala","label","lacey","llama","loopy","lousy","lucid","lurch","madam","mafia","manga","manor","marsh","maxim","melee","mirth","mocha","mogul","moist","molar","mosey","mossy","mummy","mural","nanny","navel","nudge","nutty","occam","oddly","offal","oomph","optic","outdo","ovary","panda","pansy","papal","patsy","penny","pesto","petal","picky","pious","pixel","pizza","plait","plaza","plied","poach","pooch","poppy","potty","pricy","primp","privy","prom","prong","pudgy","puffy","puppy","pushy","quack","qualm","quart","quash","query","quill","quirk","quota","rabbi","rabid","ranco","ratty","raven","rayon","recap","rummy","salsa","salve","sandy","sauna","saute","scald","scalp","scamp","scant","seize","shack","shall","shawl","shish","skimp","skulk","skunk","slack","sleek","sleet","slept","sling","sloth","slump","smite","smock","snail","snare","snide","snipe","snore","snout","solar","sonic","spasm","spelt","spill","spook","spore","spout","squat","squid","staid","stair","stale","staph","stave","steak","steep","stern","stoic","stomp","stork","stoup","strut","stung","stunk","suave","suede","surly","swami","sweat","swill","tabby","tacit","taffy","talon","tango","tangy","tarot","taunt","tepid","thump","tiara","tic","tipsy","toast","trans","trawl","tripe","truce","trull","tubal","tulip","tunic","tushy","twang","tweak","twill","twine","udder","undue","unfit","unlit","unsay","unwed","upend","usher","usurp","vaunt","verge","vexed","vicar","viola","viper","visor","vouch","vroom","wafer","wager","waist","waltz","warty","waste","waxen","weary","wedge","whack","whirr","wince","winch","wined","wiper","woken","wonky","woody","wreck","yodel","zippy","zloty"];function f(){return new Set([...p,...S])}function b(){return p[Math.floor(Math.random()*p.length)]}var k=6,C=5,L=f(),s={correct:{bg:"#22c55e",border:"#16a34a",text:"#000000"},present:{bg:"#eab308",border:"#ca8a04",text:"#000000"},absent:{bg:"#3f3f46",border:"#52525b",text:"#a1a1aa"},empty:{bg:"transparent",border:"#52525b",text:"#e4e4e7"},active:{bg:"transparent",border:"#22c55e",text:"#e4e4e7"},keyDefault:{bg:"#27272a",border:"#3f3f46",text:"#e4e4e7"}},x=[["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l"],["enter","z","x","c","v","b","n","m","\u232B"]],n;function d(e){return document.getElementById(e)}function R(){let e=d("wordle-board");e.innerHTML="";for(let o=0;o<k;o++){let a=document.createElement("div");a.className="wordle-row";for(let l=0;l<C;l++){let r=document.createElement("div");r.className="wordle-cell",r.dataset.row=String(o),r.dataset.col=String(l),a.appendChild(r)}e.appendChild(a)}}function E(){let e=d("wordle-keyboard");e.innerHTML="",x.forEach((o,a)=>{let l=document.createElement("div");l.className="wordle-kb-row",a===1&&l.classList.add("wordle-kb-row-offset"),o.forEach(r=>{let t=document.createElement("button");t.className="wordle-key",t.dataset.key=r,(r==="enter"||r==="\u232B")&&t.classList.add("wordle-key-wide"),t.textContent=r==="enter"?"\u21B5":r.toUpperCase(),t.addEventListener("click",()=>u(r)),l.appendChild(t)}),e.appendChild(l)})}function g(e,o){return d("wordle-board").children[e].children[o]}function G(e){return d("wordle-keyboard").querySelector(`[data-key="${e}"]`)}function j(){let e={};for(let o of n.guesses)for(let a=0;a<5;a++){let l=o.word[a],r=o.states[a],t=e[l];r==="correct"?e[l]="correct":r==="present"&&t!=="correct"?e[l]="present":r==="absent"&&!t&&(e[l]="absent")}return e}function v(){for(let r=0;r<n.guesses.length;r++){let t=n.guesses[r];for(let i=0;i<5;i++){let c=g(r,i);c.textContent=t.word[i].toUpperCase(),c.dataset.state=t.states[i],c.style.backgroundColor=s[t.states[i]].bg,c.style.borderColor=s[t.states[i]].border,c.style.color=s[t.states[i]].text,c.classList.add("wordle-cell-flip"),c.style.animationDelay=`${i*100}ms`}}let e=n.guesses.length;if(n.status==="playing")for(let r=0;r<5;r++){let t=g(e,r);r<n.currentRow.length?(t.textContent=n.currentRow[r].toUpperCase(),t.dataset.state="typed",t.style.backgroundColor=s.empty.bg,t.style.borderColor=s.active.border,t.style.color=s.empty.text,t.classList.add("wordle-cell-pop")):(t.textContent="",t.dataset.state="empty",t.style.backgroundColor=s.empty.bg,t.style.borderColor=s.empty.border,t.style.color=s.empty.text,t.classList.remove("wordle-cell-pop"))}for(let r=n.guesses.length+(n.status==="playing"?1:0);r<k;r++)for(let t=0;t<5;t++){let i=g(r,t);i.textContent="",i.dataset.state="empty",i.style.backgroundColor=s.empty.bg,i.style.borderColor=s.empty.border,i.style.color=s.empty.text}let o=j();x.flat().forEach(r=>{let t=G(r);if(!t)return;let i=r.length===1?r:"",c=i?o[i]:void 0;c==="correct"?(t.style.backgroundColor=s.correct.bg,t.style.borderColor=s.correct.border,t.style.color=s.correct.text):c==="present"?(t.style.backgroundColor=s.present.bg,t.style.borderColor=s.present.border,t.style.color=s.present.text):c==="absent"?(t.style.backgroundColor=s.absent.bg,t.style.borderColor=s.absent.border,t.style.color=s.absent.text):(t.style.backgroundColor=s.keyDefault.bg,t.style.borderColor=s.keyDefault.border,t.style.color=s.keyDefault.text)});let a=d("wordle-message");n.message?(a.textContent=n.message,a.classList.add("wordle-message-show"),n.status!=="playing"?a.classList.add("wordle-message-persistent"):setTimeout(()=>{a.classList.remove("wordle-message-show"),n={...n,message:""}},1500)):a.classList.remove("wordle-message-show","wordle-message-persistent");let l=d("wordle-new-game");n.status!=="playing"?l.style.display="inline-block":l.style.display="none"}function q(){let e=n.guesses.length,o=d("wordle-board").children[e];o.classList.add("wordle-row-shake"),setTimeout(()=>o.classList.remove("wordle-row-shake"),600)}function u(e){if(n.status==="playing"){if(e==="enter"){let o=m(n,L);(o.message==="Not enough letters"||o.message==="Not in word list")&&q(),n=o}else e==="\u232B"?n=y(n):/^[a-z]$/.test(e)&&(n=h(n,e));v()}}function w(){n={solution:b(),guesses:[],currentRow:"",currentRowIdx:0,status:"playing",message:""},R(),E(),v()}function M(){let e=document.createElement("style");e.textContent=`
    .wordle-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      max-width: 500px;
      margin: 0 auto;
      user-select: none;
    }
    .wordle-board {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .wordle-row {
      display: flex;
      gap: 6px;
    }
    .wordle-cell {
      width: 58px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      border: 2px solid #52525b;
      text-transform: uppercase;
      transition: background-color 0.3s, border-color 0.3s;
    }
    @media (max-width: 400px) {
      .wordle-cell {
        width: 48px;
        height: 48px;
        font-size: 1.5rem;
      }
    }
    .wordle-cell-pop {
      animation: pop 100ms ease;
    }
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    .wordle-cell-flip {
      animation: flip 500ms ease forwards;
    }
    @keyframes flip {
      0% { transform: rotateX(0deg); }
      50% { transform: rotateX(90deg); }
      100% { transform: rotateX(0deg); }
    }
    .wordle-row-shake {
      animation: shake 600ms ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
    .wordle-message {
      height: 2rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: #e4e4e7;
      text-align: center;
      opacity: 0;
      transition: opacity 0.3s;
      padding: 4px 12px;
      border-radius: 4px;
      background: #18181b;
      border: 1px solid #52525b;
    }
    .wordle-message-show {
      opacity: 1;
    }
    .wordle-message-persistent {
      background: #22c55e;
      color: #000;
      border-color: #16a34a;
    }
    .wordle-kb {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      max-width: 500px;
    }
    .wordle-kb-row {
      display: flex;
      gap: 5px;
      justify-content: center;
    }
    .wordle-kb-row-offset {
      padding-left: 24px;
    }
    .wordle-key {
      height: 52px;
      min-width: 34px;
      padding: 0 8px;
      border: 1px solid #3f3f46;
      background: #27272a;
      color: #e4e4e7;
      font-family: monospace;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      border-radius: 4px;
      transition: background-color 0.2s, border-color 0.2s, color 0.2s;
    }
    .wordle-key:hover {
      background: #3f3f46;
    }
    .wordle-key-wide {
      min-width: 56px;
      font-size: 0.75rem;
    }
    .wordle-new-game {
      display: none;
      border: 1px solid #22c55e;
      background: transparent;
      color: #22c55e;
      font-family: monospace;
      font-size: 0.875rem;
      padding: 8px 20px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
      text-transform: lowercase;
    }
    .wordle-new-game:hover {
      background: #22c55e;
      color: #000;
    }
  `,document.head.appendChild(e)}document.addEventListener("DOMContentLoaded",()=>{M(),w(),document.addEventListener("keydown",e=>{e.ctrlKey||e.metaKey||e.altKey||(e.key==="Enter"?u("enter"):e.key==="Backspace"?u("\u232B"):/^[a-zA-Z]$/.test(e.key)&&u(e.key.toLowerCase()))}),d("wordle-new-game").addEventListener("click",()=>{w()})});})();
