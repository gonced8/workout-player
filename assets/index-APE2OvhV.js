var de=Object.defineProperty;var pe=(n,e,t)=>e in n?de(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var f=(n,e,t)=>pe(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();function me(n){try{const e=JSON.parse(n);return he(e),e}catch(e){throw e instanceof SyntaxError?new Error(`Invalid JSON: ${e.message}`):e}}function he(n){if(!n||typeof n!="object")throw new Error("Workout must be an object");const e=n;if(typeof e.version!="number"||e.version!==1)throw new Error("Workout version must be 1");if(typeof e.title!="string"||!e.title)throw new Error("Workout must have a title");if(!Array.isArray(e.steps)||e.steps.length===0)throw new Error("Workout must have at least one step");for(let t=0;t<e.steps.length;t++)_(e.steps[t],`steps[${t}]`)}function _(n,e){if(!n||typeof n!="object")throw new Error(`${e}: Step must be an object`);const t=n;if(typeof t.id!="string"||!t.id)throw new Error(`${e}: Step must have an id`);if(typeof t.type!="string")throw new Error(`${e}: Step must have a type`);if(typeof t.name!="string"||!t.name)throw new Error(`${e}: Step must have a name`);switch(t.type){case"timer":if(typeof t.durationSeconds!="number"||t.durationSeconds<=0)throw new Error(`${e}: Timer step must have positive durationSeconds`);break;case"reps":if(typeof t.reps!="number"||t.reps<=0)throw new Error(`${e}: Reps step must have positive reps`);if(t.estimatedDurationSeconds!==void 0&&(typeof t.estimatedDurationSeconds!="number"||t.estimatedDurationSeconds<=0))throw new Error(`${e}: Reps step estimatedDurationSeconds must be a positive number`);break;case"group":if(typeof t.rounds!="number"||t.rounds<1)throw new Error(`${e}: Group step must have rounds >= 1`);if(!Array.isArray(t.steps)||t.steps.length===0)throw new Error(`${e}: Group step must have at least one nested step`);for(let s=0;s<t.steps.length;s++)_(t.steps[s],`${e}.steps[${s}]`);break;default:throw new Error(`${e}: Unknown step type "${t.type}"`)}}function B(n){const e=[];for(const t of n.steps)F(t,e,void 0);if(n.skipLastRest&&e.length>0){const t=e[e.length-1];t&&z(t)&&e.pop()}return e}function F(n,e,t){if(n.type==="group")fe(n,e);else{const s={...n,roundContext:t};e.push(s)}}function fe(n,e){const t={groupName:n.name,currentRound:1,totalRounds:n.rounds};for(let s=1;s<=n.rounds;s++){t.currentRound=s;const i=e.length;for(const r of n.steps)F(r,e,{...t});if(n.skipLastRest&&s===n.rounds&&e.length>i){const r=e[e.length-1];r&&z(r)&&e.pop()}}}function z(n){return n.type!=="timer"?!1:n.rest===!0||n.name.toLowerCase()==="rest"}function H(n){let e=0;for(const t of n)t.type==="timer"?e+=t.durationSeconds:e+=t.estimatedDurationSeconds??t.reps*5;return e}function $(n){const e=Math.floor(n/60),t=n%60;return e===0?`${t}s`:t===0?`${e}m`:`${e}m ${t}s`}function U(n){const e=Math.ceil(n),t=Math.floor(e/60),s=e%60;return`${t}:${s.toString().padStart(2,"0")}`}let w=null,V=!1,O=null,L=[];function P(n){return n==="suspended"||n==="interrupted"}function ye(){return window.AudioContext??window.webkitAudioContext}function g(){const n=T();if(!n||n.state!=="running"||L.length===0)return;const e=L;L=[],e.forEach(t=>t())}function ge(){const n=ye();if(!n)return null;try{const e=new n;return e.addEventListener("statechange",()=>{if(e.state==="running"){g();return}document.visibilityState==="visible"&&P(e.state)&&e.resume().then(g).catch(()=>I(e))}),e}catch{return null}}function T(){return(w==null?void 0:w.state)==="closed"&&(w=null),w||(w=ge()),w}function I(n){O===null&&(O=window.setTimeout(()=>{O=null,document.visibilityState==="visible"&&P(n.state)&&n.resume().then(g).catch(()=>{})},250))}function ve(n){L=[...L.slice(-2),n]}function we(n){const e=T();if(e){if(e.state==="running"){n();return}ve(n),P(e.state)&&e.resume().then(()=>{e.state==="running"?g():I(e)}).catch(()=>{I(e)})}}function X(){const n=T();if(n&&(P(n.state)&&n.resume().then(g).catch(()=>I(n)),n.state==="running"))try{const e=n.createBuffer(1,1,n.sampleRate),t=n.createBufferSource(),s=n.createGain();s.gain.value=0,t.buffer=e,t.connect(s),s.connect(n.destination),t.start(0),g()}catch{}}function Se(){if(V)return;V=!0;const n=()=>X(),e={passive:!0,capture:!0};window.addEventListener("pointerdown",n,e),window.addEventListener("touchend",n,e),window.addEventListener("click",n,e),window.addEventListener("keydown",n,e)}function C(){Se(),X()}function be(){const n=T();n&&(P(n.state)?n.resume().then(g).catch(()=>I(n)):n.state==="running"&&g())}function Y({frequency:n,duration:e,volume:t}){we(()=>{const s=T();if(!(!s||s.state!=="running"))try{const i=s.createOscillator(),r=s.createGain();i.connect(r),r.connect(s.destination),i.frequency.value=n,i.type="sine",r.gain.setValueAtTime(t,s.currentTime),r.gain.exponentialRampToValueAtTime(.01,s.currentTime+e),i.start(s.currentTime),i.stop(s.currentTime+e)}catch{}})}function Q(n){if("vibrate"in navigator)try{navigator.vibrate(n)}catch{}}function N(){Y({frequency:800,duration:.15,volume:.5}),Q([200,100,200])}function Z(){Y({frequency:1e3,duration:.1,volume:.3}),Q(100)}let b=null,q=!1,G=!1;async function ee(){if(!("wakeLock"in navigator))return!1;try{const n=await navigator.wakeLock.request("screen");return b=n,n.addEventListener("release",()=>{b===n&&(b=null)}),!0}catch{return!1}}async function ke(){if(b){try{await b.release()}catch{}b=null}q=!1}function J(n){q=n}async function Ee(){document.visibilityState==="visible"&&q&&!b&&await ee()}function xe(){if(G)return;G=!0;const n=()=>{Ee()};document.addEventListener("visibilitychange",n),window.addEventListener("pageshow",n),window.addEventListener("focus",n)}class $e{constructor(){f(this,"state");f(this,"timerIntervalId",null);f(this,"onStateChange",null);this.state=this.createInitialState(),xe(),this.setupVisibilityListener()}createInitialState(){return{workout:null,flatSteps:[],currentStepIndex:0,isPlaying:!1,isPaused:!1,stepStartedAt:null,timerDuration:null,remainingSeconds:null}}resetTimerState(){this.state.stepStartedAt=null,this.state.timerDuration=null,this.state.remainingSeconds=null}clearTimer(){this.timerIntervalId!==null&&(clearInterval(this.timerIntervalId),this.timerIntervalId=null)}loadWorkout(e){this.stop(),this.state={...this.createInitialState(),workout:e,flatSteps:B(e)},this.notifyStateChange()}async start(){if(!this.state.workout||this.state.flatSteps.length===0)throw new Error("No workout loaded");C(),this.state.isPlaying=!0,this.state.isPaused=!1,J(!0),await ee(),this.startCurrentStep(),this.notifyStateChange()}pause(){if(!this.state.isPlaying||this.state.isPaused)return;this.state.isPaused=!0,this.clearTimer();const e=this.getCurrentStep();if((e==null?void 0:e.type)==="timer"&&this.state.stepStartedAt!==null&&this.state.timerDuration!==null){const t=(Date.now()-this.state.stepStartedAt)/1e3;this.state.remainingSeconds=Math.max(0,this.state.timerDuration-t),this.state.timerDuration=this.state.remainingSeconds}this.notifyStateChange()}resume(){!this.state.isPlaying||!this.state.isPaused||(C(),this.state.isPaused=!1,this.startCurrentStep(),this.notifyStateChange())}next(){var e;this.state.isPlaying&&(C(),this.clearTimer(),((e=this.getCurrentStep())==null?void 0:e.type)==="timer"&&N(),this.advanceToNextStep())}stop(){this.clearTimer(),this.state.isPlaying=!1,this.state.isPaused=!1,this.resetTimerState(),J(!1),ke(),this.notifyStateChange()}completeRepsStep(){const e=this.getCurrentStep();(e==null?void 0:e.type)==="reps"&&this.state.isPlaying&&(C(),N(),this.advanceToNextStep())}getState(){return{...this.state}}getCurrentStep(){return this.state.flatSteps[this.state.currentStepIndex]??null}onUpdate(e){this.onStateChange=e}startCurrentStep(){const e=this.getCurrentStep();if(!e){this.completeWorkout();return}e.type==="timer"?this.startTimer(e):(this.resetTimerState(),this.notifyStateChange())}startTimer(e){const t=this.state.timerDuration??e.durationSeconds;this.state.stepStartedAt=Date.now(),this.state.timerDuration=t,this.state.remainingSeconds=t,this.timerIntervalId=window.setInterval(()=>this.updateTimer(),100),this.notifyStateChange()}updateTimer(){const e=this.state.remainingSeconds,t=this.computeRemaining();this.state.remainingSeconds=t;const s=e?Math.ceil(e):0,i=Math.ceil(t);s!==i&&i>=1&&i<=3&&Z(),t<=0?this.onTimerComplete():this.notifyStateChange()}computeRemaining(){if(this.state.stepStartedAt===null||this.state.timerDuration===null)return 0;const e=(Date.now()-this.state.stepStartedAt)/1e3;return Math.max(0,this.state.timerDuration-e)}onTimerComplete(){this.clearTimer(),this.state.remainingSeconds=0,N(),this.advanceToNextStep()}advanceToNextStep(){this.state.currentStepIndex++,this.state.isPaused=!1,this.state.currentStepIndex>=this.state.flatSteps.length?this.completeWorkout():(this.resetTimerState(),this.startCurrentStep())}completeWorkout(){this.stop(),this.notifyStateChange()}setupVisibilityListener(){const e=()=>{if(document.visibilityState==="visible"&&this.state.isPlaying&&!this.state.isPaused){be();const t=this.getCurrentStep();(t==null?void 0:t.type)==="timer"&&(this.computeRemaining()<=0?this.onTimerComplete():this.notifyStateChange())}};document.addEventListener("visibilitychange",e),window.addEventListener("pageshow",e),window.addEventListener("focus",e)}notifyStateChange(){var e;(e=this.onStateChange)==null||e.call(this,this.getState())}}class Ce{constructor(e){f(this,"appElement");f(this,"currentView","landing");f(this,"callbacks",null);f(this,"lastStepIndex",-1);f(this,"lastPauseState",!1);this.appElement=e}showLanding(e,t,s,i=[],r,o){var E,x,R,j;this.currentView="landing";const a=o!==void 0?'<button type="button" id="view-schema-btn" class="secondary">View JSON Schema</button>':"",u=this.renderRecentWorkouts(i),c=o!==void 0?`
        <dialog id="schema-dialog" class="schema-dialog">
          <div class="schema-dialog-panel">
            <div class="schema-dialog-header">
              <h2 class="schema-dialog-title">Workout JSON Schema</h2>
              <div class="schema-dialog-actions">
                <button type="button" id="schema-dialog-copy" class="primary">Copy</button>
                <button type="button" id="schema-dialog-close" class="secondary">Close</button>
              </div>
            </div>
            <div class="schema-dialog-body">
              <pre class="schema-dialog-pre"><code id="schema-dialog-code"></code></pre>
            </div>
          </div>
        </dialog>`:"";if(this.appElement.innerHTML=`
      <div class="landing">
        <h1>Workout Player</h1>
        <p>Paste your workout JSON or load a sample to get started.</p>
        
        <div class="input-section">
          <label for="workout-json">Workout JSON:</label>
          <textarea 
            id="workout-json" 
            placeholder="Paste workout JSON here..."
            rows="10"
          ></textarea>
          <div id="duration-estimate"></div>
          <div id="error-message" class="error"></div>
        </div>

        ${u}

        <div class="button-group">
          <button type="button" id="load-sample-btn" class="secondary">Load Sample</button>
          ${a}
          <button id="start-btn" class="primary">Validate & Preview</button>
        </div>
        ${c}

        <div class="version">v1.1.0</div>
      </div>
    `,o!==void 0){const m=document.getElementById("schema-dialog-code");m&&(m.textContent=o);const l=document.getElementById("schema-dialog"),p=document.getElementById("schema-dialog-copy"),le="Copy",ue=async()=>{var M;try{if((M=navigator.clipboard)!=null&&M.writeText)return await navigator.clipboard.writeText(o),!0}catch{}const h=document.createElement("textarea");h.value=o,h.setAttribute("readonly",""),h.style.position="fixed",h.style.left="-9999px",document.body.appendChild(h),h.select();try{return document.execCommand("copy")}catch{return!1}finally{document.body.removeChild(h)}};(E=document.getElementById("view-schema-btn"))==null||E.addEventListener("click",()=>{l==null||l.showModal()}),(x=document.getElementById("schema-dialog-close"))==null||x.addEventListener("click",()=>{l==null||l.close()}),p==null||p.addEventListener("click",()=>{ue().then(h=>{p&&h&&(p.textContent="Copied!",window.setTimeout(()=>{p.textContent=le},2e3))})})}const d=document.getElementById("workout-json"),k=document.getElementById("error-message"),v=document.getElementById("duration-estimate");r&&(d.value=r,d.dispatchEvent(new Event("input"))),d.addEventListener("input",()=>{try{const m=d.value.trim();if(m){const l=JSON.parse(m),p=B(l);v.textContent=`Estimated duration: ${$(H(p))}`,v.className="duration-estimate",k.textContent=""}else v.textContent=""}catch{v.textContent=""}}),(R=document.getElementById("start-btn"))==null||R.addEventListener("click",()=>{const m=d.value.trim();if(!m){k.textContent="Please enter workout JSON";return}try{e(m)}catch(l){k.textContent=l instanceof Error?l.message:"Invalid workout"}}),(j=document.getElementById("load-sample-btn"))==null||j.addEventListener("click",t),i.forEach((m,l)=>{var p;(p=document.getElementById(`recent-workout-${l}`))==null||p.addEventListener("click",()=>s(m.workout))})}renderRecentWorkouts(e){return e.length===0?"":`
      <section class="recent-workouts" aria-labelledby="recent-workouts-title">
        <h2 id="recent-workouts-title">Recent workouts</h2>
        <p>Resume or repeat one of your last ${e.length} workouts.</p>
        <div class="recent-workout-list">
          ${e.map((t,s)=>`
              <button type="button" id="recent-workout-${s}" class="recent-workout-card">
                <span class="recent-workout-title">${this.escapeHtml(t.title)}</span>
                <span class="recent-workout-date">${this.formatLastPlayedAt(t.lastPlayedAt)}</span>
              </button>`).join("")}
        </div>
      </section>`}formatLastPlayedAt(e){const t=new Date(e);return Number.isNaN(t.getTime())?"Played locally":`Last played ${t.toLocaleDateString([],{month:"short",day:"numeric"})} ${t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}showPreview(e,t,s,i){var a,u,c;this.currentView="preview";const r=H(t),o=this.stepsTreeHasNotes(e.steps);this.appElement.innerHTML=`
      <div class="preview">
        <h1 class="preview-title">${e.title}</h1>
        ${e.description?`<p class="preview-description">${e.description}</p>`:""}
        ${(a=e.equipment)!=null&&a.length?`<p class="preview-equipment">Equipment: ${e.equipment.join(", ")}</p>`:""}
        <p class="preview-duration">Estimated duration: ${$(r)} · ${t.length} steps</p>
        <ul class="preview-steps">
          ${this.renderPreviewStepsTree(e.steps)}
        </ul>
        ${o?'<p class="preview-notes-hint">Tap a step with notes to see coaching cues.</p>':""}
        <div class="preview-actions">
          <button id="preview-back-btn" class="secondary large">Back to edit</button>
          <button id="preview-start-btn" class="primary large">Start workout</button>
        </div>
      </div>
    `,(u=document.getElementById("preview-back-btn"))==null||u.addEventListener("click",s),(c=document.getElementById("preview-start-btn"))==null||c.addEventListener("click",i)}stepsTreeHasNotes(e){for(const t of e)if(t.notes||t.type==="group"&&this.stepsTreeHasNotes(t.steps))return!0;return!1}renderPreviewStepsTree(e){return e.map(t=>{if(t.type==="timer")return t.notes?`
          <li class="preview-step preview-step-timer preview-step-expandable">
            <details class="preview-step-details">
              <summary class="preview-step-summary">
                <span class="preview-step-name">${t.name}</span>
                <span class="preview-step-meta">${$(t.durationSeconds)}</span>
              </summary>
              <p class="preview-step-notes">${t.notes}</p>
            </details>
          </li>`:`
          <li class="preview-step preview-step-timer">
            <span class="preview-step-name">${t.name}</span>
            <span class="preview-step-meta">${$(t.durationSeconds)}</span>
          </li>`;if(t.type==="reps")return t.notes?`
          <li class="preview-step preview-step-reps preview-step-expandable">
            <details class="preview-step-details">
              <summary class="preview-step-summary">
                <span class="preview-step-name">${t.name}</span>
                <span class="preview-step-meta">× ${t.reps} reps</span>
              </summary>
              <p class="preview-step-notes">${t.notes}</p>
            </details>
          </li>`:`
          <li class="preview-step preview-step-reps">
            <span class="preview-step-name">${t.name}</span>
            <span class="preview-step-meta">× ${t.reps} reps</span>
          </li>`;const s=t.rounds===1?"1 round":`${t.rounds} rounds`;return t.notes?`
        <li class="preview-step preview-step-group">
          <details class="preview-group-details">
            <summary class="preview-group-header preview-group-summary">
              <span class="preview-group-name">${t.name}</span>
              <span class="preview-group-rounds">× ${s}</span>
            </summary>
            <p class="preview-step-notes preview-group-notes">${t.notes}</p>
          </details>
          <ul class="preview-group-steps">
            ${this.renderPreviewStepsTree(t.steps)}
          </ul>
        </li>`:`
        <li class="preview-step preview-step-group">
          <div class="preview-group-header">
            <span class="preview-group-name">${t.name}</span>
            <span class="preview-group-rounds">× ${s}</span>
          </div>
          <ul class="preview-group-steps">
            ${this.renderPreviewStepsTree(t.steps)}
          </ul>
        </li>`}).join("")}showCountdown(e,t){this.currentView="countdown",C();const s=t?`<div class="next-preview countdown-next-preview">${this.renderNextPreview(t)}</div>`:"",r=/iPad|iPhone|iPod/.test(navigator.userAgent)?'<p class="silent-mode-hint">Turn off silent mode for audio cues</p>':"";this.appElement.innerHTML=`
      <div class="countdown">
        <div class="countdown-number" id="countdown-number">3</div>
        <p class="countdown-label">Get ready</p>
        ${r}
        ${s}
      </div>
    `;let o=3;const a=document.getElementById("countdown-number"),u=this.appElement.querySelector(".countdown-label"),c=()=>{o>0?(a&&(a.textContent=String(o)),Z(),o--,setTimeout(c,1e3)):(a&&(a.textContent="Go!"),u&&(u.textContent=""),N(),setTimeout(e,400))};c()}showPlayer(e,t,s,i,r,o){this.callbacks={onPause:t,onResume:s,onNext:i,onComplete:r,onEnd:o},this.currentView!=="player"?(this.currentView="player",this.lastStepIndex=-1,this.lastPauseState=!1,this.renderPlayer(e)):this.updatePlayer(e)}renderPlayer(e){var t;this.appElement.innerHTML=`
      <div class="player">
        <div class="player-header">
          <h2 id="workout-title"></h2>
          <button id="end-btn" class="secondary">End Workout</button>
        </div>

        <div class="progress-bar">
          <div id="progress-fill" class="progress-fill"></div>
        </div>
        <div id="progress-text" class="progress-text"></div>

        <div id="step-content" class="step-content"></div>

        <div id="next-preview" class="next-preview"></div>

        <div id="controls" class="controls"></div>
      </div>
    `,(t=document.getElementById("end-btn"))==null||t.addEventListener("click",()=>{var s;return(s=this.callbacks)==null?void 0:s.onEnd()}),this.updatePlayer(e)}updatePlayer(e){const{workout:t,flatSteps:s,currentStepIndex:i,isPaused:r,remainingSeconds:o}=e;if(!t)return;const a=i!==this.lastStepIndex,u=r!==this.lastPauseState;if(this.lastStepIndex=i,this.lastPauseState=r,a||u)this.fullUpdate(e);else{const c=s[i];if((c==null?void 0:c.type)==="timer"&&o!==null){const d=document.querySelector(".timer");d&&(d.textContent=U(o))}}}fullUpdate(e){const{workout:t,flatSteps:s,currentStepIndex:i,isPaused:r,remainingSeconds:o}=e;if(!t)return;const a=s[i],u=s[i+1],c=document.getElementById("workout-title");c&&(c.textContent=t.title);const d=document.getElementById("progress-fill"),k=document.getElementById("progress-text");if(d&&k){const R=s.length>0?i/s.length*100:0;d.style.width=`${R}%`,k.textContent=`Step ${Math.min(i+1,s.length)} of ${s.length}`}const v=document.getElementById("step-content");v&&(v.innerHTML=a?this.renderStep(a,o):'<div class="complete"><h2>Workout Complete!</h2><p>Great job!</p></div>');const E=document.getElementById("next-preview");E&&(u?E.innerHTML=this.renderNextPreview(u):E.innerHTML='<p class="next-preview-last">Last step!</p>');const x=document.getElementById("controls");x&&a&&(x.innerHTML=this.renderControls(a,r),this.attachControlListeners(a,r))}renderNextPreview(e){const t=e.type==="timer"?$(e.durationSeconds):`× ${e.reps} reps`;let s=`
      <p class="next-preview-label">Up next</p>
      <p class="next-preview-name">${e.name}</p>
      <p class="next-preview-meta">${t}</p>`;return e.notes&&(s+=`<p class="next-preview-notes">${e.notes}</p>`),s}renderStep(e,t){const s=['<div class="step">'];if(e.roundContext){const{groupName:i,currentRound:r,totalRounds:o}=e.roundContext;s.push(`<div class="round-context">${i} — Round ${r} of ${o}</div>`)}if(s.push(`<h2 class="step-name">${e.name}</h2>`),e.type==="timer"){const i=t??e.durationSeconds;s.push(`<div class="timer">${U(i)}</div>`)}else s.push(`<div class="reps">× ${e.reps} reps</div>`);return e.notes&&s.push(`<p class="notes">${e.notes}</p>`),s.push("</div>"),s.join("")}renderControls(e,t){return e.type==="timer"?`${t?'<button id="resume-btn" class="primary large">Resume</button>':'<button id="pause-btn" class="primary large">Pause</button>'}<button id="next-btn" class="secondary">Skip</button>`:'<button id="complete-btn" class="primary large">Done</button>'}attachControlListeners(e,t){var s,i,r,o;this.callbacks&&(e.type==="timer"?(t?(s=document.getElementById("resume-btn"))==null||s.addEventListener("click",this.callbacks.onResume):(i=document.getElementById("pause-btn"))==null||i.addEventListener("click",this.callbacks.onPause),(r=document.getElementById("next-btn"))==null||r.addEventListener("click",this.callbacks.onNext)):(o=document.getElementById("complete-btn"))==null||o.addEventListener("click",this.callbacks.onComplete))}showError(e){const t=document.getElementById("error-message");t&&(t.textContent=e,t.className="error visible")}loadSampleIntoTextarea(e){const t=document.getElementById("workout-json");t&&(t.value=e,t.dispatchEvent(new Event("input")))}}const te="workout-player:recent-workouts",ne=3;function Le(n){if(!n||typeof n!="object")return!1;const e=n;return typeof e.id=="string"&&typeof e.title=="string"&&(typeof e.lastPlayedAt=="string"||typeof e.savedAt=="string")&&!!e.workout&&typeof e.workout=="object"}function se(){try{return window.localStorage}catch{return null}}function W(n){return Array.isArray(n)?n.map(W):n&&typeof n=="object"?Object.fromEntries(Object.entries(n).sort(([e],[t])=>e.localeCompare(t)).map(([e,t])=>[e,W(t)])):n}function ie(n){return JSON.stringify(W({title:n.title,description:n.description,equipment:n.equipment,skipLastRest:n.skipLastRest,steps:n.steps}))}function K(n){if(!n)return 0;const e=new Date(n).getTime();return Number.isNaN(e)?0:e}function Ie(n){return{...n,id:ie(n.workout),lastPlayedAt:n.lastPlayedAt??n.savedAt??new Date(0).toISOString()}}function A(){const n=se();if(!n)return[];try{const e=n.getItem(te);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t.filter(Le).map(Ie).sort((s,i)=>K(i.lastPlayedAt)-K(s.lastPlayedAt)).filter((s,i,r)=>r.findIndex(o=>o.id===s.id)===i).slice(0,ne):[]}catch{return[]}}function Pe(n){const e=se();if(!e)return[];const t=new Date().toISOString(),s=ie(n),r=[{id:s,title:n.title,lastPlayedAt:t,workout:n},...A().filter(o=>o.id!==s)].slice(0,ne);try{e.setItem(te,JSON.stringify(r))}catch{return A()}return r}const Te="https://json-schema.org/draft/2020-12/schema",Re="https://workout-player.pages.dev/schemas/workout-playback.json",Ne="Workout Playback Format",Ae="Format for workouts that the player app consumes",Oe="object",We=["version","title","steps"],Be={version:{type:"number",const:1,description:"Schema version (must be 1)"},title:{type:"string",minLength:1,description:"Workout title"},description:{type:"string",description:"Optional workout description"},equipment:{type:"array",items:{type:"string"},description:"Equipment needed for the workout"},skipLastRest:{type:"boolean",description:"Skip the last rest step at the end of the workout"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Array of workout steps"}},qe={step:{oneOf:[{$ref:"#/$defs/timerStep"},{$ref:"#/$defs/repsStep"},{$ref:"#/$defs/groupStep"}]},timerStep:{type:"object",required:["id","type","name","durationSeconds"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"timer"},name:{type:"string",minLength:1,description:"Step name (e.g., Warm up, Rest)"},durationSeconds:{type:"number",minimum:1,description:"Duration in seconds"},rest:{type:"boolean",description:"Mark as rest for skipLastRest logic"},notes:{type:"string",description:"Optional coaching cues or notes"}}},repsStep:{type:"object",required:["id","type","name","reps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"reps"},name:{type:"string",minLength:1,description:"Exercise name (e.g., Push-ups, Squats)"},reps:{type:"number",minimum:1,description:"Number of repetitions"},estimatedDurationSeconds:{type:"number",minimum:1,description:"Optional estimated duration in seconds for total workout time estimation"},notes:{type:"string",description:"Optional coaching cues or notes"}}},groupStep:{type:"object",required:["id","type","name","rounds","steps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"group"},name:{type:"string",minLength:1,description:"Group name (e.g., Circuit 1)"},rounds:{type:"number",minimum:1,description:"Number of rounds to repeat"},skipLastRest:{type:"boolean",description:"Skip the last rest step in each round"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Steps to repeat for each round"},notes:{type:"string",description:"Optional notes about the group"}}}},De={$schema:Te,$id:Re,title:Ne,description:Ae,type:Oe,required:We,properties:Be,$defs:qe},re=JSON.stringify(De,null,2),je=document.querySelector("#app"),y=new $e,S=new Ce(je),Me={version:1,title:"Circuit workout",description:"Warm up, 3 rounds of push-ups and squats with rest between, then cool down.",equipment:["bodyweight"],skipLastRest:!0,steps:[{id:"warmup",type:"timer",name:"Warm up",durationSeconds:90},{id:"circuit-1",type:"group",name:"Circuit 1",rounds:3,skipLastRest:!0,steps:[{id:"c1-pushups",type:"reps",name:"Push-ups",reps:10,estimatedDurationSeconds:30,notes:"Keep your core tight"},{id:"c1-rest1",type:"timer",name:"Rest",durationSeconds:30},{id:"c1-squats",type:"reps",name:"Squats",reps:12,estimatedDurationSeconds:40,notes:"Go deep!"},{id:"c1-rest2",type:"timer",name:"Rest",durationSeconds:30}]},{id:"cooldown",type:"timer",name:"Cool down",durationSeconds:60}]};function oe(){S.showLanding(D,ae,ce,A(),void 0,re)}function D(n){try{const e=me(n),t=B(e);S.showPreview(e,t,()=>S.showLanding(D,ae,ce,A(),n,re),()=>S.showCountdown(()=>He(e),t[0]??null))}catch(e){S.showError(e instanceof Error?e.message:"Invalid workout")}}function He(n){Pe(n),y.loadWorkout(n),y.start();const e=()=>{S.showPlayer(y.getState(),()=>y.pause(),()=>y.resume(),()=>y.next(),()=>y.completeRepsStep(),Ue)};y.onUpdate(e),e()}function ae(){S.loadSampleIntoTextarea(JSON.stringify(Me,null,2))}function ce(n){D(JSON.stringify(n,null,2))}function Ue(){y.stop(),oe()}oe();
