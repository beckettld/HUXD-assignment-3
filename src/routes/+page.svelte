<script>
  import { onMount } from 'svelte';
  
  let activeTab = 'agent1'; // 'agent1', 'agent2', or 'agent3'
  let input = '';
  let messages = {
    agent1: [],
    agent2: [],
    agent3: []
  };
  let debugOpen = false;
  let replierInput = {
    agent1: null,
    agent2: null,
    agent3: null
  }; // { frameSet, contextCount, agent, reasons }
  let isLoading = {
    agent1: false,
    agent2: false,
    agent3: false
  };
  let errorMsg = {
    agent1: '',
    agent2: '',
    agent3: ''
  };
  
  $: currentMessages = messages[activeTab];
  $: currentReplierInput = replierInput[activeTab];
  $: currentIsLoading = isLoading[activeTab];
  $: currentErrorMsg = errorMsg[activeTab];

  onMount(() => {
    // Auto-trigger opening message for Agent 2 on page load
    if (activeTab === 'agent2' && messages[activeTab].length === 0) {
      getOpeningMessage();
    }
    // Auto-trigger opening message for Agent 3 on page load
    if (activeTab === 'agent3' && messages[activeTab].length === 0) {
      getAgent3OpeningMessage();
    }
  });

  function switchTab(tab) {
    activeTab = tab;
    // Clear the current tab's state when switching
    replierInput[tab] = null;
    errorMsg[tab] = '';
    isLoading[tab] = false;
    
    // Auto-trigger opening message for Agent 2 if it's empty
    if (tab === 'agent2' && messages[tab].length === 0) {
      getOpeningMessage();
    }
    // Auto-trigger opening message for Agent 3 if it's empty
    if (tab === 'agent3' && messages[tab].length === 0) {
      getAgent3OpeningMessage();
    }
  }

  function clearChat() {
    messages[activeTab] = [];
    replierInput[activeTab] = null;
    errorMsg[activeTab] = '';
    isLoading[activeTab] = false;
    
    // Auto-trigger opening message for Agent 2 after clearing
    if (activeTab === 'agent2') {
      getOpeningMessage();
    }
    // Auto-trigger opening message for Agent 3 after clearing
    if (activeTab === 'agent3') {
      getAgent3OpeningMessage();
    }
  }

  function getOpeningMessage() {
    if (activeTab !== 'agent2') return;
    
    // Curated list of opening messages with questions
    const openingMessages = [
      {
        message: `You've found your way here. Good. Don't mind the quiet—I prefer it this way. Take a seat. Each day, I'll offer you a question—not for me, but for you. When the week is done, I'll gather what you've written and share what the silence has taught me.`,
        question: "What small moment today reminded you of who you really are?"
      },
      {
        message: `Welcome. No grand speeches—just gentle questions and the space to answer them. Write honestly. By week's end, I'll send you a letter: a few insights from an old soul who favors calm over chatter.`,
        question: "If you could whisper one piece of advice to yourself from a year ago, what would it be?"
      },
      {
        message: `You're here for reflection, not performance. Each day I'll give you a question—something simple, but not always easy. At the end of the week, I'll offer my perspective, drawn from quiet observation and a bit of well-worn wisdom.`,
        question: "What emotion did you feel most strongly today, and where in your body did you feel it?"
      },
      {
        message: `Sit with me awhile. The world can be noisy, but here it's peaceful. I'll ask one question each day; you write what you will. Once the week settles, I'll share a thoughtful letter: plain, honest, and a little bit zen.`,
        question: "What pattern in your life are you ready to change, and what's the first step?"
      }
    ];
    
    // Pick a random opening message
    const randomIndex = Math.floor(Math.random() * openingMessages.length);
    const selected = openingMessages[randomIndex];
    
    const fullMessage = `${selected.message}

Here's your first reflection question to get you started:

**"${selected.question}"**

Take your time with this question. There's no right or wrong way to answer it - just write whatever comes to mind. This is your space to explore your thoughts and feelings.

When you're ready to write your diary entry, just start typing your response to this question.`;
    
    messages[activeTab] = [{ role: 'assistant', content: fullMessage }];
    replierInput[activeTab] = { 
      frameSet: { frames: { persona: { value: 'journal_intro' } } },
      contextCount: 0,
      agent: 'agent2',
      reasons: 'Generated opening message'
    };
  }

  async function getAgent3OpeningMessage() {
    if (activeTab !== 'agent3') return;
    
    console.log('Generating Agent3 opening message...');
    
    try {
      const res = await fetch('/api/chat-agent3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [] })
      });
      
      console.log('Agent3 API response status:', res.status);
      
      if (!res.ok) {
        console.error('Agent3 API error:', res.status, res.statusText);
        const errorData = await res.json();
        console.error('Error data:', errorData);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Agent3 API response data:', data);
      
      if (data.assistantMessage) {
        console.log('Setting Agent3 opening message:', data.assistantMessage);
        messages[activeTab] = [{ role: 'assistant', content: data.assistantMessage }];
        replierInput[activeTab] = data.replierInput || { 
          frameSet: { frames: { persona: { value: 'riddle_realms_intro' } } },
          contextCount: 0,
          agent: 'agent3',
          reasons: 'Generated opening message for Riddle Realms'
        };
      } else {
        console.error('No assistantMessage in response:', data);
        messages[activeTab] = [{ role: 'assistant', content: 'Welcome to Riddle Realms! Your mystical adventure begins...' }];
      }
    } catch (error) {
      console.error('Error generating opening message:', error);
      // Fallback to simple message
      messages[activeTab] = [{ role: 'assistant', content: 'Welcome to Riddle Realms! Your mystical adventure begins...' }];
    }
  }

  function getEndpoint() {
    switch(activeTab) {
      case 'agent1': return '/api/chat-agent1';
      case 'agent2': return '/api/chat-agent2';
      case 'agent3': return '/api/chat-agent3';
      default: return '/api/chat-agent1';
    }
  }

  async function send() {
    const content = input.trim();
    if (!content) return;
    messages[activeTab] = [...messages[activeTab], { role: 'user', content }];
    input = '';
    isLoading[activeTab] = true;
    errorMsg[activeTab] = '';
    const res = await fetch(getEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: messages[activeTab] })
    });
    const data = await res.json();
    if (!res.ok || data?.error) {
      errorMsg[activeTab] = data?.error || 'Request failed';
      isLoading[activeTab] = false;
      return;
    }
    if (data.assistantMessage) {
      messages[activeTab] = [...messages[activeTab], { role: 'assistant', content: data.assistantMessage }];
      replierInput[activeTab] = data.replierInput || null;
    }
    isLoading[activeTab] = false;
  }
</script>

<style>
  :global(:root) {
    --bg: #0f172a;
    --bg-grad-a: #0b1223;
    --bg-grad-b: #111827;
    --card: #ffffff;
    --card-muted: #f8fafc;
    --border: #e5e7eb;
    --text: #0f172a;
    --muted: #64748b;
    --primary: #2563eb;
    --primary-600: #1d4ed8;
  }

  :global(html, body) {
    height: 100%;
    margin: 0;
    background: radial-gradient(1200px 600px at 20% -10%, rgba(37,99,235,0.25), transparent),
                radial-gradient(900px 500px at 100% 0%, rgba(34,197,94,0.18), transparent),
                linear-gradient(180deg, var(--bg-grad-a), var(--bg-grad-b));
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
  }

  :global(*), :global(*::before), :global(*::after) { box-sizing: border-box; }

  .container { max-width: 960px; margin: 2.5rem auto; padding: 0 1rem; }
  h1 { color: #e5ebff; letter-spacing: 0.2px; margin: 0 0 0.25rem 0; font-weight: 650; }
  .subtle { color: #a5b4fc; font-size: 0.95rem; margin-bottom: 0.75rem; }

  .row { display: flex; gap: 0.5rem; align-items: center; }
  .chat {
    border-radius: 12px;
    padding: 1rem;
    min-height: 320px;
    max-height: 800px; /* enable scroll beyond 800px */
    overflow-y: auto;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(2,6,23,0.12);
    -webkit-overflow-scrolling: touch;
  }
  .flexcol { display: flex; flex-direction: column; gap: 0.35rem; }
  .bubble { padding: 0.65rem 0.85rem; border-radius: 12px; margin: 0.25rem 0; max-width: 80%; white-space: pre-wrap; line-height: 1.4; }
  .user { background: #e8f0ff; color: #0b1a3a; align-self: flex-end; border: 1px solid #c7d2fe; }
  .assistant { background: #f5f7fb; color: #0f172a; align-self: flex-start; border: 1px solid #e5e7eb; }
  .bubble:hover { outline: 2px solid transparent; box-shadow: 0 1px 0 rgba(2,6,23,0.04); }
  .meta { color: var(--muted); font-size: 0.8rem; margin-bottom: 0.15rem; }

  .toolbar { display: flex; gap: 1rem; align-items: center; justify-content: space-between; margin: 0.75rem 0; }

  input[type="text"] {
    padding: 0.6rem 0.7rem; border-radius: 10px; border: 1px solid var(--border); background: var(--card);
    outline: none; transition: border-color .15s ease, box-shadow .15s ease;
  }
  input[type="text"]:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }

  :global(button) { padding: 0.55rem 0.9rem; border: 1px solid transparent; border-radius: 10px; background: var(--primary); color: white; cursor: pointer; font-weight: 550; }
  :global(button:hover) { background: var(--primary-600); }
  :global(button.secondary) { background: var(--card); color: var(--text); border-color: var(--border); }
  :global(button.secondary:hover) { background: var(--card-muted); }

  .debug { background: var(--card); border: 1px dashed var(--border); padding: 0.75rem; margin-top: 0.75rem; border-radius: 10px; box-shadow: 0 2px 14px rgba(2,6,23,0.06);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.85rem; }

  .error {
    background: #fff1f2;
    color: #7f1d1d;
    border: 1px solid #fecaca;
    padding: 0.6rem 0.75rem;
    border-radius: 10px;
    margin: 0.5rem 0 0.75rem 0;
  }

  .typing { display: inline-flex; gap: 6px; align-items: center; }
  .dot { width: 7px; height: 7px; background: #a3aab8; border-radius: 50%; animation: blink 1.4s infinite both; }
  .dot:nth-child(2) { animation-delay: .2s; }
  .dot:nth-child(3) { animation-delay: .4s; }
  @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

  @media (max-width: 640px) {
    .bubble { max-width: 92%; }
    .toolbar { gap: 0.5rem; }
    .container { margin: 1.25rem auto; }
  }

  .tabs { 
    display: flex; 
    gap: 0.5rem; 
    margin-bottom: 1rem; 
    border-bottom: 2px solid var(--border);
    padding-bottom: 0;
  }
  .tab { 
    padding: 0.65rem 1.25rem; 
    background: transparent; 
    color: var(--muted); 
    border: none; 
    border-bottom: 3px solid transparent;
    cursor: pointer; 
    font-weight: 550; 
    transition: all 0.2s ease;
    margin-bottom: -2px;
  }
  .tab:hover { 
    color: var(--primary); 
    background: rgba(37, 99, 235, 0.05);
  }
  .tab.active { 
    color: var(--primary); 
    border-bottom-color: var(--primary);
  }
  .tab-description {
    color: #a5b4fc;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(37, 99, 235, 0.08);
    border-radius: 8px;
    border-left: 3px solid var(--primary);
  }
</style>

<div class="container">
  <h1>A3: Multi-agent Interaction </h1>
  <div class="subtle">Conversational demo with three distinct agents</div>
  
  <div class="tabs">
    <button class="tab" class:active={activeTab === 'agent1'} on:click={() => switchTab('agent1')}>
      Agent 1
    </button>
    <button class="tab" class:active={activeTab === 'agent2'} on:click={() => switchTab('agent2')}>
      Agent 2
    </button>
    <button class="tab" class:active={activeTab === 'agent3'} on:click={() => switchTab('agent3')}>
      Agent 3
    </button>
  </div>

  {#if activeTab === 'agent1'}
    <div class="tab-description">
      <strong>Agent 1 - Energetic & Encouraging:</strong> A bubbly, energetic friend who uplifts and inspires. Perfect for celebrations, motivation, and positivity.
    </div>
  {:else if activeTab === 'agent2'}
    <div class="tab-description">
      <strong>Agent 2 - Weekly Diary Mentor:</strong> A thoughtful journal companion who provides daily reflection questions and generates personalized mentor letters at the end of each week. Perfect for self-discovery, personal growth, and gaining wisdom through daily writing.
    </div>
  {:else}
    <div class="tab-description">
      <strong>Agent 3 - Creative Innovator:</strong> An imaginative brainstormer excelling at creative problem-solving. Ideal for ideation, creative blocks, and exploring possibilities.
    </div>
  {/if}

  <div class="toolbar" style="margin: 0.5rem 0 0.75rem 0;">
    <button class="secondary" on:click={() => (debugOpen = !debugOpen)}>{debugOpen ? 'Hide' : 'Show'} Debug</button>
    <button class="secondary" on:click={clearChat}>Clear Chat</button>
  </div>

  {#if currentErrorMsg}
    <div class="error" role="alert">
      {currentErrorMsg}
    </div>
  {/if}

  <div class="chat flexcol">
    {#each currentMessages as m, i}
      <div class="bubble {m.role}">
        <div class="meta">{m.role}</div>
        <div>{m.content}</div>
      </div>
    {/each}
    {#if currentIsLoading}
      <div class="bubble assistant">
        <div class="meta">assistant</div>
        <div class="typing" aria-label="Assistant is typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    {/if}
  </div>

  <div class="row" style="margin-top: 0.75rem;">
    <input type="text"
      placeholder="Type a message..."
      bind:value={input}
      on:keydown={(e) => e.key === 'Enter' && send()}
      style="flex: 1; padding: 0.6rem; border-radius: 6px; border: 1px solid #ddd;"
    />
    <button on:click={send}>Send</button>
  </div>

</div>

{#if debugOpen}
  <div class="debug">
    <div><strong>Active Tab:</strong> {activeTab}</div>
    <div><strong>Messages:</strong> {currentMessages.length}</div>
    {#if currentReplierInput}
      <div style="margin-top: 0.5rem;">
        <div><strong>Context Count:</strong> {currentReplierInput.contextCount}</div>
        <div><strong>Agent:</strong> {currentReplierInput.agent || 'n/a'}</div>
        <div><strong>Reason:</strong> {currentReplierInput.reasons || 'n/a'}</div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; margin-top: 0.35rem;">
          {#each Object.entries(currentReplierInput.frameSet?.frames || {}) as [name, p]}
            <div><strong>{name}</strong>: {p?.value}</div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
