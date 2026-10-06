---
title: 'Greek, Theology, and the Shape of Good Software'
slug: theology-linguistics-and-software-engineering
publishDate: '2026-10-05'
description: 'My education was in theology and linguistics; my trade is software engineering. The connection is not that these fields are the same, but that each taught me to work carefully with meaning, assumptions, and complex systems.'
categories: ['Software Development']
tags: ['software-engineering', 'linguistics', 'theology', 'systems-thinking']
author: Andrew
comments_enabled: true
featured: true
image: '/assets/blog/theology-linguistics-and-software-engineering.webp'
---

My formal education was in theology and linguistics. My trade is software
engineering. People sometimes hear that combination as an odd bit of biography,
something to mention after the useful qualifications are out of the way.

I don't think of it that way. I spent time studying Greek when I could have
been learning Python, which felt like a strange detour at the time. Those
subjects didn't teach me how to write a web server or debug a race condition.
They did teach me habits of thought that I use all the time: pay attention to
what words mean, ask what assumptions a system rests on, and don't confuse a
tidy explanation with a true one.

That is not the same as saying theology is programming or linguistics is computer
science. The fields have different questions and standards of evidence. The
useful connection is in the work you do while trying to answer those questions.

## Meaning Is More Than Syntax

A sentence can be grammatically correct and still be unclear, misleading, or
nonsensical. Code has the same problem. It can compile, pass a narrow test, and
still express the wrong idea.

Syntax tells you whether a statement fits the rules of a language. Semantics is
about what that statement means. Programming makes the distinction unusually
visible: the compiler can accept a perfectly valid expression whose behavior is
nothing like what the person reading it expects.

That gap is why names matter. A function called `validateUser` makes a promise.
Does it check an email address? Confirm authorization? Persist a record? If the
name and behavior disagree, the code may work today and still mislead the next
person who has to change it. Clear names and small interfaces are not decoration.
They are how we make intent legible.

Linguistics gave me a useful instinct here: meaning depends on structure and
context. A word does not carry every part of its meaning by itself. Neither does
a method name, a type, or a line of code. You have to understand how it is used,
what surrounds it, and what expectations the rest of the system brings to it.

## Reading a Codebase Is an Act of Interpretation

When I open an unfamiliar codebase, I am not just looking for the file that
contains the bug. I am trying to understand what the people who built it thought
they were doing.

Why is this value stored here? Why does this function accept that shape of data?
Which odd-looking behavior is an accident, and which one is a constraint imposed
by a system nobody wants to break? The code is evidence, but it is not the whole
story. There are also tests, commit history, naming patterns, deployment
assumptions, and the occasional comment that is more wishful thinking than
truth.

That resembles the interpretive work I learned in theology. A text has a
history, an audience, a context, and a relationship to other texts. You do not
understand it well by grabbing one sentence and making it answer whatever you
already wanted to ask. You look at the surrounding material, the assumptions at
work, and the different ways a passage has been understood.

Legacy code deserves the same patience. It may be awkward for good reasons, or
it may be awkward because someone was tired on a Thursday. You cannot know which
until you investigate. Interpretation does not mean approving of everything you
find. It means understanding what is there before you change it.

## Every Design Has Commitments

Software systems are built around assumptions. A system might assume that every
account has one owner, that a request can be retried safely, or that a value can
never be missing. Those assumptions become structure: database constraints,
types, authorization rules, APIs, and tests.

If the assumptions are inconsistent, the system eventually makes you pay for
it. Sometimes that cost arrives as a production bug. Sometimes it arrives much
later, when a new feature does not fit the model and the team discovers that an
important rule was never written down.

Theology taught me to notice how much depends on first principles. A conclusion
is only as coherent as the premises and the reasoning that connect them. In
software, I use that same discipline in a more practical form: make the
invariants explicit, trace what follows from them, and check whether the pieces
still fit together.

This does not make architecture a branch of theology. It does make both kinds
of work less mysterious. In each, you have to keep a large structure in view
while examining its individual claims. You have to notice when two rules quietly
contradict each other. And you have to be willing to revise the model when the
evidence does not fit.

## Ambiguity Is a Design Problem

Human language is full of ambiguity. We rely on context, shared knowledge, and
repair when we misunderstand each other. Machines are much less forgiving. An
API that leaves an important behavior ambiguous does not get to rely on a
helpful tone of voice.

That makes the design of interfaces a kind of practical language work. What
should this parameter mean? Is this operation safe to repeat? What does an
empty result mean: no data, no permission, or an error? A good interface answers
those questions clearly enough that both its callers and its maintainers can
reason about it.

Not every ambiguity can be removed. Requirements are often incomplete, and
people use the same words for different things. But noticing the ambiguity
before it gets baked into a database schema or public API is much cheaper than
untangling it afterward. Asking "what do we mean by this?" is a technical
question, even if it does not look like one on a task board.

## The Connection Is a Habit of Mind

I would not trade my education for a claim that it made me a better engineer by
some measurable amount. That would be hard to prove, and it would miss the point.
The connection is more ordinary than that. Years spent interpreting texts and
studying how meaning works left me more attentive to assumptions, context, and
how ideas fit together.

Those habits are useful when I am designing a system, reading old code, naming
an interface, or trying to understand what a requirement actually asks for.
They do not replace computer science, experience, or technical skill. They sit
beside them.

A career does not have to follow a straight line for its parts to belong
together. Sometimes the things you studied before you knew what your work would
become turn out to be part of how you do that work. For me, theology and
linguistics were not detours from software engineering. They gave me another
way to think about the same stubborn questions: What does this mean? What does
it assume? And how do we know the pieces fit together?
