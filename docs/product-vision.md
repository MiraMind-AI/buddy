# Product Vision

## What Buddy Is

Buddy is a personal, web-based voice companion. The product lets users have natural spoken conversations with an AI that learns about them over time, remembers context across sessions, and responds in a way that feels like a continuous relationship rather than a series of isolated exchanges.

The core bet is that memory and voice together create something qualitatively different from a standard chatbot. A user should be able to say "you mentioned last week that I was stressed about work" and Buddy should know what that refers to.

## What Buddy Is Not

Buddy is not a task automation tool. It is not a customer support agent. It is not a general-purpose assistant optimized for answering questions quickly. Those products exist.

Buddy is for people who want a thoughtful conversational companion they can return to over time.

## Core Capabilities

**Voice conversation** - Users speak; Buddy responds with natural synthesized speech. The interaction should feel low-latency and natural, not like dictating to a machine.

**Long-term memory** - Facts, preferences, and emotional context are stored across sessions. The system should surface relevant memories when they matter without forcing them into every response.

**Memory transparency and control** - Users can see exactly what Buddy remembers about them, correct inaccuracies, and delete anything. Memory is never hidden.

**Modern web UI** - The interface is clean, quiet, and designed for focused use. No clutter. The visual design should feel like a quality consumer product.

**3D avatar** - Later in the roadmap, a visible 3D face or character will respond to voice state. This is a differentiating quality feature, not a gimmick.

## User

The initial target is a technically curious adult who uses productivity tools daily and wants something more personal than a chatbot. They are comfortable with web applications and value both quality and privacy.

## Key Tensions to Navigate

**Memory vs. privacy** - The product value comes from remembering, but trust comes from giving users full control. Both must be true at the same time.

**Natural vs. fast** - Voice interactions feel natural when latency is low. Achieving low latency while maintaining quality responses requires careful infrastructure design.

**Personal vs. safe** - A companion that knows a lot about a person handles sensitive information. The system must be designed with that responsibility in mind from the beginning.

## Success Criteria at 12 Months

- A user can have a fluid, low-latency voice conversation with Buddy in a browser.
- Buddy remembers facts from previous conversations and uses them appropriately.
- The user can open a memory panel, read every stored fact, and delete any of them.
- The 3D avatar is visible and responds to voice state in a convincing way.
- Two people can use separate accounts on a deployed instance.
- The codebase is maintainable and can be worked on by a small team.
