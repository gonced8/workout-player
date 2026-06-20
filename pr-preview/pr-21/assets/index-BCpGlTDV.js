var te=Object.defineProperty;var se=(s,e,t)=>e in s?te(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var f=(s,e,t)=>se(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();function ne(s){try{const e=JSON.parse(s);return re(e),e}catch(e){throw e instanceof SyntaxError?new Error(`Invalid JSON: ${e.message}`):e}}function re(s){if(!s||typeof s!="object")throw new Error("Workout must be an object");const e=s;if(typeof e.version!="number"||e.version!==1)throw new Error("Workout version must be 1");if(typeof e.title!="string"||!e.title)throw new Error("Workout must have a title");if(!Array.isArray(e.steps)||e.steps.length===0)throw new Error("Workout must have at least one step");for(let t=0;t<e.steps.length;t++)D(e.steps[t],`steps[${t}]`)}function D(s,e){if(!s||typeof s!="object")throw new Error(`${e}: Step must be an object`);const t=s;if(typeof t.id!="string"||!t.id)throw new Error(`${e}: Step must have an id`);if(typeof t.type!="string")throw new Error(`${e}: Step must have a type`);if(typeof t.name!="string"||!t.name)throw new Error(`${e}: Step must have a name`);switch(t.type){case"timer":if(typeof t.durationSeconds!="number"||t.durationSeconds<=0)throw new Error(`${e}: Timer step must have positive durationSeconds`);break;case"reps":if(typeof t.reps!="number"||t.reps<=0)throw new Error(`${e}: Reps step must have positive reps`);if(t.estimatedDurationSeconds!==void 0&&(typeof t.estimatedDurationSeconds!="number"||t.estimatedDurationSeconds<=0))throw new Error(`${e}: Reps step estimatedDurationSeconds must be a positive number`);break;case"group":if(typeof t.rounds!="number"||t.rounds<1)throw new Error(`${e}: Group step must have rounds >= 1`);if(!Array.isArray(t.steps)||t.steps.length===0)throw new Error(`${e}: Group step must have at least one nested step`);for(let n=0;n<t.steps.length;n++)D(t.steps[n],`${e}.steps[${n}]`);break;default:throw new Error(`${e}: Unknown step type "${t.type}"`)}}function L(s){const e=[];for(const t of s.steps)j(t,e,void 0);if(s.skipLastRest&&e.length>0){const t=e[e.length-1];t&&M(t)&&e.pop()}return e}function j(s,e,t){if(s.type==="group")ie(s,e);else{const n={...s,roundContext:t};e.push(n)}}function ie(s,e){const t={groupName:s.name,currentRound:1,totalRounds:s.rounds};for(let n=1;n<=s.rounds;n++){t.currentRound=n;const r=e.length;for(const i of s.steps)j(i,e,{...t});if(s.skipLastRest&&n===s.rounds&&e.length>r){const i=e[e.length-1];i&&M(i)&&e.pop()}}}function M(s){return s.type!=="timer"?!1:s.rest===!0||s.name.toLowerCase()==="rest"}function A(s){let e=0;for(const t of s)t.type==="timer"?e+=t.durationSeconds:e+=t.estimatedDurationSeconds??t.reps*5;return e}function E(s){const e=Math.floor(s/60),t=s%60;return e===0?`${t}s`:t===0?`${e}m`:`${e}m ${t}s`}function B(s){const e=Math.ceil(s),t=Math.floor(e/60),n=e%60;return`${t}:${n.toString().padStart(2,"0")}`}let T=null;function I(){return!T&&"AudioContext"in window&&(T=new AudioContext),T}function P(s){return s==="suspended"||s==="interrupted"}function oe(s){const e=I();if(e){if(P(e.state)){e.resume().then(s).catch(()=>{});return}s()}}function H(){const s=I();s&&P(s.state)&&s.resume().catch(()=>{})}function ae(){const s=I();!s||s.state==="closed"||P(s.state)&&s.resume().catch(()=>{})}function U({frequency:s,duration:e,volume:t}){oe(()=>{const n=I();if(!(!n||n.state!=="running"))try{const r=n.createOscillator(),i=n.createGain();r.connect(i),i.connect(n.destination),r.frequency.value=s,r.type="sine",i.gain.setValueAtTime(t,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+e),r.start(n.currentTime),r.stop(n.currentTime+e)}catch{}})}function V(s){if("vibrate"in navigator)try{navigator.vibrate(s)}catch{}}function x(){U({frequency:800,duration:.15,volume:.5}),V([200,100,200])}function J(){U({frequency:1e3,duration:.1,volume:.3}),V(100)}let w=null,N=!1;async function G(){if(!("wakeLock"in navigator))return!1;try{const s=await navigator.wakeLock.request("screen");return w=s,s.addEventListener("release",()=>{w===s&&(w=null)}),!0}catch{return!1}}async function ce(){if(w){try{await w.release()}catch{}w=null}N=!1}function q(s){N=s}function le(){document.addEventListener("visibilitychange",async()=>{document.visibilityState==="visible"&&N&&!w&&await G()})}class pe{constructor(){f(this,"state");f(this,"timerIntervalId",null);f(this,"onStateChange",null);this.state=this.createInitialState(),le(),this.setupVisibilityListener()}createInitialState(){return{workout:null,flatSteps:[],currentStepIndex:0,isPlaying:!1,isPaused:!1,stepStartedAt:null,timerDuration:null,remainingSeconds:null}}resetTimerState(){this.state.stepStartedAt=null,this.state.timerDuration=null,this.state.remainingSeconds=null}clearTimer(){this.timerIntervalId!==null&&(clearInterval(this.timerIntervalId),this.timerIntervalId=null)}loadWorkout(e){this.stop(),this.state={...this.createInitialState(),workout:e,flatSteps:L(e)},this.notifyStateChange()}async start(){if(!this.state.workout||this.state.flatSteps.length===0)throw new Error("No workout loaded");H(),this.state.isPlaying=!0,this.state.isPaused=!1,q(!0),await G(),this.startCurrentStep(),this.notifyStateChange()}pause(){if(!this.state.isPlaying||this.state.isPaused)return;this.state.isPaused=!0,this.clearTimer();const e=this.getCurrentStep();if((e==null?void 0:e.type)==="timer"&&this.state.stepStartedAt!==null&&this.state.timerDuration!==null){const t=(Date.now()-this.state.stepStartedAt)/1e3;this.state.remainingSeconds=Math.max(0,this.state.timerDuration-t),this.state.timerDuration=this.state.remainingSeconds}this.notifyStateChange()}resume(){!this.state.isPlaying||!this.state.isPaused||(this.state.isPaused=!1,this.startCurrentStep(),this.notifyStateChange())}next(){var e;this.state.isPlaying&&(this.clearTimer(),((e=this.getCurrentStep())==null?void 0:e.type)==="timer"&&x(),this.advanceToNextStep())}stop(){this.clearTimer(),this.state.isPlaying=!1,this.state.isPaused=!1,this.resetTimerState(),q(!1),ce(),this.notifyStateChange()}completeRepsStep(){const e=this.getCurrentStep();(e==null?void 0:e.type)==="reps"&&this.state.isPlaying&&(x(),this.advanceToNextStep())}getState(){return{...this.state}}getCurrentStep(){return this.state.flatSteps[this.state.currentStepIndex]??null}onUpdate(e){this.onStateChange=e}startCurrentStep(){const e=this.getCurrentStep();if(!e){this.completeWorkout();return}e.type==="timer"?this.startTimer(e):(this.resetTimerState(),this.notifyStateChange())}startTimer(e){const t=this.state.timerDuration??e.durationSeconds;this.state.stepStartedAt=Date.now(),this.state.timerDuration=t,this.state.remainingSeconds=t,this.timerIntervalId=window.setInterval(()=>this.updateTimer(),100),this.notifyStateChange()}updateTimer(){const e=this.state.remainingSeconds,t=this.computeRemaining();this.state.remainingSeconds=t;const n=e?Math.ceil(e):0,r=Math.ceil(t);n!==r&&r>=1&&r<=3&&J(),t<=0?this.onTimerComplete():this.notifyStateChange()}computeRemaining(){if(this.state.stepStartedAt===null||this.state.timerDuration===null)return 0;const e=(Date.now()-this.state.stepStartedAt)/1e3;return Math.max(0,this.state.timerDuration-e)}onTimerComplete(){this.clearTimer(),this.state.remainingSeconds=0,x(),this.advanceToNextStep()}advanceToNextStep(){this.state.currentStepIndex++,this.state.isPaused=!1,this.state.currentStepIndex>=this.state.flatSteps.length?this.completeWorkout():(this.resetTimerState(),this.startCurrentStep())}completeWorkout(){this.stop(),this.notifyStateChange()}setupVisibilityListener(){document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&this.state.isPlaying&&!this.state.isPaused){ae();const e=this.getCurrentStep();(e==null?void 0:e.type)==="timer"&&(this.computeRemaining()<=0?this.onTimerComplete():this.notifyStateChange())}})}notifyStateChange(){var e;(e=this.onStateChange)==null||e.call(this,this.getState())}}class ue{constructor(e){f(this,"appElement");f(this,"currentView","landing");f(this,"callbacks",null);f(this,"lastStepIndex",-1);f(this,"lastPauseState",!1);this.appElement=e}showLanding(e,t,n,r=[],i,o){var b,k,$,O;this.currentView="landing";const a=o!==void 0?'<button type="button" id="view-schema-btn" class="secondary">View JSON Schema</button>':"",p=this.renderRecentWorkouts(r),c=o!==void 0?`
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

        ${p}

        <div class="button-group">
          <button type="button" id="load-sample-btn" class="secondary">Load Sample</button>
          ${a}
          <button id="start-btn" class="primary">Validate & Preview</button>
        </div>
        ${c}

        <div class="version">v1.0.1</div>
      </div>
    `,o!==void 0){const m=document.getElementById("schema-dialog-code");m&&(m.textContent=o);const l=document.getElementById("schema-dialog"),d=document.getElementById("schema-dialog-copy"),Z="Copy",ee=async()=>{var W;try{if((W=navigator.clipboard)!=null&&W.writeText)return await navigator.clipboard.writeText(o),!0}catch{}const h=document.createElement("textarea");h.value=o,h.setAttribute("readonly",""),h.style.position="fixed",h.style.left="-9999px",document.body.appendChild(h),h.select();try{return document.execCommand("copy")}catch{return!1}finally{document.body.removeChild(h)}};(b=document.getElementById("view-schema-btn"))==null||b.addEventListener("click",()=>{l==null||l.showModal()}),(k=document.getElementById("schema-dialog-close"))==null||k.addEventListener("click",()=>{l==null||l.close()}),d==null||d.addEventListener("click",()=>{ee().then(h=>{d&&h&&(d.textContent="Copied!",window.setTimeout(()=>{d.textContent=Z},2e3))})})}const u=document.getElementById("workout-json"),S=document.getElementById("error-message"),v=document.getElementById("duration-estimate");i&&(u.value=i,u.dispatchEvent(new Event("input"))),u.addEventListener("input",()=>{try{const m=u.value.trim();if(m){const l=JSON.parse(m),d=L(l);v.textContent=`Estimated duration: ${E(A(d))}`,v.className="duration-estimate",S.textContent=""}else v.textContent=""}catch{v.textContent=""}}),($=document.getElementById("start-btn"))==null||$.addEventListener("click",()=>{const m=u.value.trim();if(!m){S.textContent="Please enter workout JSON";return}try{e(m)}catch(l){S.textContent=l instanceof Error?l.message:"Invalid workout"}}),(O=document.getElementById("load-sample-btn"))==null||O.addEventListener("click",t),r.forEach((m,l)=>{var d;(d=document.getElementById(`recent-workout-${l}`))==null||d.addEventListener("click",()=>n(m.workout))})}renderRecentWorkouts(e){return e.length===0?"":`
      <section class="recent-workouts" aria-labelledby="recent-workouts-title">
        <h2 id="recent-workouts-title">Recent workouts</h2>
        <p>Resume or repeat one of your last ${e.length} workouts.</p>
        <div class="recent-workout-list">
          ${e.map((t,n)=>`
              <button type="button" id="recent-workout-${n}" class="recent-workout-card">
                <span class="recent-workout-title">${this.escapeHtml(t.title)}</span>
                <span class="recent-workout-date">${this.formatSavedAt(t.savedAt)}</span>
              </button>`).join("")}
        </div>
      </section>`}formatSavedAt(e){const t=new Date(e);return Number.isNaN(t.getTime())?"Saved locally":`Saved ${t.toLocaleDateString([],{month:"short",day:"numeric"})} ${t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}showPreview(e,t,n,r){var a,p,c;this.currentView="preview";const i=A(t),o=this.stepsTreeHasNotes(e.steps);this.appElement.innerHTML=`
      <div class="preview">
        <h1 class="preview-title">${e.title}</h1>
        ${e.description?`<p class="preview-description">${e.description}</p>`:""}
        ${(a=e.equipment)!=null&&a.length?`<p class="preview-equipment">Equipment: ${e.equipment.join(", ")}</p>`:""}
        <p class="preview-duration">Estimated duration: ${E(i)} · ${t.length} steps</p>
        <ul class="preview-steps">
          ${this.renderPreviewStepsTree(e.steps)}
        </ul>
        ${o?'<p class="preview-notes-hint">Tap a step with notes to see coaching cues.</p>':""}
        <div class="preview-actions">
          <button id="preview-back-btn" class="secondary large">Back to edit</button>
          <button id="preview-start-btn" class="primary large">Start workout</button>
        </div>
      </div>
    `,(p=document.getElementById("preview-back-btn"))==null||p.addEventListener("click",n),(c=document.getElementById("preview-start-btn"))==null||c.addEventListener("click",r)}stepsTreeHasNotes(e){for(const t of e)if(t.notes||t.type==="group"&&this.stepsTreeHasNotes(t.steps))return!0;return!1}renderPreviewStepsTree(e){return e.map(t=>{if(t.type==="timer")return t.notes?`
          <li class="preview-step preview-step-timer preview-step-expandable">
            <details class="preview-step-details">
              <summary class="preview-step-summary">
                <span class="preview-step-name">${t.name}</span>
                <span class="preview-step-meta">${E(t.durationSeconds)}</span>
              </summary>
              <p class="preview-step-notes">${t.notes}</p>
            </details>
          </li>`:`
          <li class="preview-step preview-step-timer">
            <span class="preview-step-name">${t.name}</span>
            <span class="preview-step-meta">${E(t.durationSeconds)}</span>
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
          </li>`;const n=t.rounds===1?"1 round":`${t.rounds} rounds`;return t.notes?`
        <li class="preview-step preview-step-group">
          <details class="preview-group-details">
            <summary class="preview-group-header preview-group-summary">
              <span class="preview-group-name">${t.name}</span>
              <span class="preview-group-rounds">× ${n}</span>
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
            <span class="preview-group-rounds">× ${n}</span>
          </div>
          <ul class="preview-group-steps">
            ${this.renderPreviewStepsTree(t.steps)}
          </ul>
        </li>`}).join("")}showCountdown(e,t){this.currentView="countdown",H();const n=t?`<div class="next-preview countdown-next-preview">${this.renderNextPreview(t)}</div>`:"",i=/iPad|iPhone|iPod/.test(navigator.userAgent)?'<p class="silent-mode-hint">Turn off silent mode for audio cues</p>':"";this.appElement.innerHTML=`
      <div class="countdown">
        <div class="countdown-number" id="countdown-number">3</div>
        <p class="countdown-label">Get ready</p>
        ${i}
        ${n}
      </div>
    `;let o=3;const a=document.getElementById("countdown-number"),p=this.appElement.querySelector(".countdown-label"),c=()=>{o>0?(a&&(a.textContent=String(o)),J(),o--,setTimeout(c,1e3)):(a&&(a.textContent="Go!"),p&&(p.textContent=""),x(),setTimeout(e,400))};c()}showPlayer(e,t,n,r,i,o){this.callbacks={onPause:t,onResume:n,onNext:r,onComplete:i,onEnd:o},this.currentView!=="player"?(this.currentView="player",this.lastStepIndex=-1,this.lastPauseState=!1,this.renderPlayer(e)):this.updatePlayer(e)}renderPlayer(e){var t;this.appElement.innerHTML=`
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
    `,(t=document.getElementById("end-btn"))==null||t.addEventListener("click",()=>{var n;return(n=this.callbacks)==null?void 0:n.onEnd()}),this.updatePlayer(e)}updatePlayer(e){const{workout:t,flatSteps:n,currentStepIndex:r,isPaused:i,remainingSeconds:o}=e;if(!t)return;const a=r!==this.lastStepIndex,p=i!==this.lastPauseState;if(this.lastStepIndex=r,this.lastPauseState=i,a||p)this.fullUpdate(e);else{const c=n[r];if((c==null?void 0:c.type)==="timer"&&o!==null){const u=document.querySelector(".timer");u&&(u.textContent=B(o))}}}fullUpdate(e){const{workout:t,flatSteps:n,currentStepIndex:r,isPaused:i,remainingSeconds:o}=e;if(!t)return;const a=n[r],p=n[r+1],c=document.getElementById("workout-title");c&&(c.textContent=t.title);const u=document.getElementById("progress-fill"),S=document.getElementById("progress-text");if(u&&S){const $=n.length>0?r/n.length*100:0;u.style.width=`${$}%`,S.textContent=`Step ${Math.min(r+1,n.length)} of ${n.length}`}const v=document.getElementById("step-content");v&&(v.innerHTML=a?this.renderStep(a,o):'<div class="complete"><h2>Workout Complete!</h2><p>Great job!</p></div>');const b=document.getElementById("next-preview");b&&(p?b.innerHTML=this.renderNextPreview(p):b.innerHTML='<p class="next-preview-last">Last step!</p>');const k=document.getElementById("controls");k&&a&&(k.innerHTML=this.renderControls(a,i),this.attachControlListeners(a,i))}renderNextPreview(e){const t=e.type==="timer"?E(e.durationSeconds):`× ${e.reps} reps`;let n=`
      <p class="next-preview-label">Up next</p>
      <p class="next-preview-name">${e.name}</p>
      <p class="next-preview-meta">${t}</p>`;return e.notes&&(n+=`<p class="next-preview-notes">${e.notes}</p>`),n}renderStep(e,t){const n=['<div class="step">'];if(e.roundContext){const{groupName:r,currentRound:i,totalRounds:o}=e.roundContext;n.push(`<div class="round-context">${r} — Round ${i} of ${o}</div>`)}if(n.push(`<h2 class="step-name">${e.name}</h2>`),e.type==="timer"){const r=t??e.durationSeconds;n.push(`<div class="timer">${B(r)}</div>`)}else n.push(`<div class="reps">× ${e.reps} reps</div>`);return e.notes&&n.push(`<p class="notes">${e.notes}</p>`),n.push("</div>"),n.join("")}renderControls(e,t){return e.type==="timer"?`${t?'<button id="resume-btn" class="primary large">Resume</button>':'<button id="pause-btn" class="primary large">Pause</button>'}<button id="next-btn" class="secondary">Skip</button>`:'<button id="complete-btn" class="primary large">Done</button>'}attachControlListeners(e,t){var n,r,i,o;this.callbacks&&(e.type==="timer"?(t?(n=document.getElementById("resume-btn"))==null||n.addEventListener("click",this.callbacks.onResume):(r=document.getElementById("pause-btn"))==null||r.addEventListener("click",this.callbacks.onPause),(i=document.getElementById("next-btn"))==null||i.addEventListener("click",this.callbacks.onNext)):(o=document.getElementById("complete-btn"))==null||o.addEventListener("click",this.callbacks.onComplete))}showError(e){const t=document.getElementById("error-message");t&&(t.textContent=e,t.className="error visible")}loadSampleIntoTextarea(e){const t=document.getElementById("workout-json");t&&(t.value=e,t.dispatchEvent(new Event("input")))}}const K="workout-player:recent-workouts",_=3;function de(s){if(!s||typeof s!="object")return!1;const e=s;return typeof e.id=="string"&&typeof e.title=="string"&&typeof e.savedAt=="string"&&!!e.workout&&typeof e.workout=="object"}function F(){try{return window.localStorage}catch{return null}}function C(){const s=F();if(!s)return[];try{const e=s.getItem(K);if(!e)return[];const t=JSON.parse(e);return Array.isArray(t)?t.filter(de).slice(0,_):[]}catch{return[]}}function me(s){const e=F();if(!e)return[];const t=new Date().toISOString(),n=`${s.title}:${JSON.stringify(s.steps)}`,i=[{id:n,title:s.title,savedAt:t,workout:s},...C().filter(o=>o.id!==n)].slice(0,_);try{e.setItem(K,JSON.stringify(i))}catch{return C()}return i}const he="https://json-schema.org/draft/2020-12/schema",fe="https://workout-player.pages.dev/schemas/workout-playback.json",ye="Workout Playback Format",ve="Format for workouts that the player app consumes",ge="object",we=["version","title","steps"],Se={version:{type:"number",const:1,description:"Schema version (must be 1)"},title:{type:"string",minLength:1,description:"Workout title"},description:{type:"string",description:"Optional workout description"},equipment:{type:"array",items:{type:"string"},description:"Equipment needed for the workout"},skipLastRest:{type:"boolean",description:"Skip the last rest step at the end of the workout"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Array of workout steps"}},be={step:{oneOf:[{$ref:"#/$defs/timerStep"},{$ref:"#/$defs/repsStep"},{$ref:"#/$defs/groupStep"}]},timerStep:{type:"object",required:["id","type","name","durationSeconds"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"timer"},name:{type:"string",minLength:1,description:"Step name (e.g., Warm up, Rest)"},durationSeconds:{type:"number",minimum:1,description:"Duration in seconds"},rest:{type:"boolean",description:"Mark as rest for skipLastRest logic"},notes:{type:"string",description:"Optional coaching cues or notes"}}},repsStep:{type:"object",required:["id","type","name","reps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"reps"},name:{type:"string",minLength:1,description:"Exercise name (e.g., Push-ups, Squats)"},reps:{type:"number",minimum:1,description:"Number of repetitions"},estimatedDurationSeconds:{type:"number",minimum:1,description:"Optional estimated duration in seconds for total workout time estimation"},notes:{type:"string",description:"Optional coaching cues or notes"}}},groupStep:{type:"object",required:["id","type","name","rounds","steps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"group"},name:{type:"string",minLength:1,description:"Group name (e.g., Circuit 1)"},rounds:{type:"number",minimum:1,description:"Number of rounds to repeat"},skipLastRest:{type:"boolean",description:"Skip the last rest step in each round"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Steps to repeat for each round"},notes:{type:"string",description:"Optional notes about the group"}}}},ke={$schema:he,$id:fe,title:ye,description:ve,type:ge,required:we,properties:Se,$defs:be},X=JSON.stringify(ke,null,2),Ee=document.querySelector("#app"),y=new pe,g=new ue(Ee),$e={version:1,title:"Circuit workout",description:"Warm up, 3 rounds of push-ups and squats with rest between, then cool down.",equipment:["bodyweight"],skipLastRest:!0,steps:[{id:"warmup",type:"timer",name:"Warm up",durationSeconds:90},{id:"circuit-1",type:"group",name:"Circuit 1",rounds:3,skipLastRest:!0,steps:[{id:"c1-pushups",type:"reps",name:"Push-ups",reps:10,estimatedDurationSeconds:30,notes:"Keep your core tight"},{id:"c1-rest1",type:"timer",name:"Rest",durationSeconds:30},{id:"c1-squats",type:"reps",name:"Squats",reps:12,estimatedDurationSeconds:40,notes:"Go deep!"},{id:"c1-rest2",type:"timer",name:"Rest",durationSeconds:30}]},{id:"cooldown",type:"timer",name:"Cool down",durationSeconds:60}]};function Y(){g.showLanding(R,z,Q,C(),void 0,X)}function R(s){try{const e=ne(s),t=L(e);g.showPreview(e,t,()=>g.showLanding(R,z,Q,C(),s,X),()=>g.showCountdown(()=>xe(e),t[0]??null))}catch(e){g.showError(e instanceof Error?e.message:"Invalid workout")}}function xe(s){me(s),y.loadWorkout(s),y.start();const e=()=>{g.showPlayer(y.getState(),()=>y.pause(),()=>y.resume(),()=>y.next(),()=>y.completeRepsStep(),Ce)};y.onUpdate(e),e()}function z(){g.loadSampleIntoTextarea(JSON.stringify($e,null,2))}function Q(s){R(JSON.stringify(s,null,2))}function Ce(){y.stop(),Y()}Y();
