var K=Object.defineProperty;var _=(s,e,t)=>e in s?K(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var m=(s,e,t)=>_(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();function z(s){try{const e=JSON.parse(s);return Q(e),e}catch(e){throw e instanceof SyntaxError?new Error(`Invalid JSON: ${e.message}`):e}}function Q(s){if(!s||typeof s!="object")throw new Error("Workout must be an object");const e=s;if(typeof e.version!="number"||e.version!==1)throw new Error("Workout version must be 1");if(typeof e.title!="string"||!e.title)throw new Error("Workout must have a title");if(!Array.isArray(e.steps)||e.steps.length===0)throw new Error("Workout must have at least one step");for(let t=0;t<e.steps.length;t++)B(e.steps[t],`steps[${t}]`)}function B(s,e){if(!s||typeof s!="object")throw new Error(`${e}: Step must be an object`);const t=s;if(typeof t.id!="string"||!t.id)throw new Error(`${e}: Step must have an id`);if(typeof t.type!="string")throw new Error(`${e}: Step must have a type`);if(typeof t.name!="string"||!t.name)throw new Error(`${e}: Step must have a name`);switch(t.type){case"timer":if(typeof t.durationSeconds!="number"||t.durationSeconds<=0)throw new Error(`${e}: Timer step must have positive durationSeconds`);break;case"reps":if(typeof t.reps!="number"||t.reps<=0)throw new Error(`${e}: Reps step must have positive reps`);if(t.estimatedDurationSeconds!==void 0&&(typeof t.estimatedDurationSeconds!="number"||t.estimatedDurationSeconds<=0))throw new Error(`${e}: Reps step estimatedDurationSeconds must be a positive number`);break;case"group":if(typeof t.rounds!="number"||t.rounds<1)throw new Error(`${e}: Group step must have rounds >= 1`);if(!Array.isArray(t.steps)||t.steps.length===0)throw new Error(`${e}: Group step must have at least one nested step`);for(let n=0;n<t.steps.length;n++)B(t.steps[n],`${e}.steps[${n}]`);break;default:throw new Error(`${e}: Unknown step type "${t.type}"`)}}function C(s){const e=[];for(const t of s.steps)W(t,e,void 0);if(s.skipLastRest&&e.length>0){const t=e[e.length-1];t&&O(t)&&e.pop()}return e}function W(s,e,t){if(s.type==="group")X(s,e);else{const n={...s,roundContext:t};e.push(n)}}function X(s,e){const t={groupName:s.name,currentRound:1,totalRounds:s.rounds};for(let n=1;n<=s.rounds;n++){t.currentRound=n;const i=e.length;for(const r of s.steps)W(r,e,{...t});if(s.skipLastRest&&n===s.rounds&&e.length>i){const r=e[e.length-1];r&&O(r)&&e.pop()}}}function O(s){return s.type!=="timer"?!1:s.rest===!0||s.name.toLowerCase()==="rest"}function T(s){let e=0;for(const t of s)t.type==="timer"?e+=t.durationSeconds:e+=t.estimatedDurationSeconds??t.reps*5;return e}function E(s){const e=Math.floor(s/60),t=s%60;return e===0?`${t}s`:t===0?`${e}m`:`${e}m ${t}s`}function N(s){const e=Math.ceil(s),t=Math.floor(e/60),n=e%60;return`${t}:${n.toString().padStart(2,"0")}`}let $=null;function k(){return!$&&"AudioContext"in window&&($=new AudioContext),$}function I(s){return s==="suspended"||s==="interrupted"}function Y(s){const e=k();if(e){if(I(e.state)){e.resume().then(s).catch(()=>{});return}s()}}function q(){const s=k();s&&I(s.state)&&s.resume().catch(()=>{})}function Z(){const s=k();!s||s.state==="closed"||I(s.state)&&s.resume().catch(()=>{})}function D({frequency:s,duration:e,volume:t}){Y(()=>{const n=k();if(!(!n||n.state!=="running"))try{const i=n.createOscillator(),r=n.createGain();i.connect(r),r.connect(n.destination),i.frequency.value=s,i.type="sine",r.gain.setValueAtTime(t,n.currentTime),r.gain.exponentialRampToValueAtTime(.01,n.currentTime+e),i.start(n.currentTime),i.stop(n.currentTime+e)}catch{}})}function A(s){if("vibrate"in navigator)try{navigator.vibrate(s)}catch{}}function x(){D({frequency:800,duration:.15,volume:.5}),A([200,100,200])}function M(){D({frequency:1e3,duration:.1,volume:.3}),A(100)}let g=null,P=!1;async function j(){if(!("wakeLock"in navigator))return!1;try{const s=await navigator.wakeLock.request("screen");return g=s,s.addEventListener("release",()=>{g===s&&(g=null)}),!0}catch{return!1}}async function ee(){if(g){try{await g.release()}catch{}g=null}P=!1}function R(s){P=s}function te(){document.addEventListener("visibilitychange",async()=>{document.visibilityState==="visible"&&P&&!g&&await j()})}class se{constructor(){m(this,"state");m(this,"timerIntervalId",null);m(this,"onStateChange",null);this.state=this.createInitialState(),te(),this.setupVisibilityListener()}createInitialState(){return{workout:null,flatSteps:[],currentStepIndex:0,isPlaying:!1,isPaused:!1,stepStartedAt:null,timerDuration:null,remainingSeconds:null}}resetTimerState(){this.state.stepStartedAt=null,this.state.timerDuration=null,this.state.remainingSeconds=null}clearTimer(){this.timerIntervalId!==null&&(clearInterval(this.timerIntervalId),this.timerIntervalId=null)}loadWorkout(e){this.stop(),this.state={...this.createInitialState(),workout:e,flatSteps:C(e)},this.notifyStateChange()}async start(){if(!this.state.workout||this.state.flatSteps.length===0)throw new Error("No workout loaded");q(),this.state.isPlaying=!0,this.state.isPaused=!1,R(!0),await j(),this.startCurrentStep(),this.notifyStateChange()}pause(){if(!this.state.isPlaying||this.state.isPaused)return;this.state.isPaused=!0,this.clearTimer();const e=this.getCurrentStep();if((e==null?void 0:e.type)==="timer"&&this.state.stepStartedAt!==null&&this.state.timerDuration!==null){const t=(Date.now()-this.state.stepStartedAt)/1e3;this.state.remainingSeconds=Math.max(0,this.state.timerDuration-t),this.state.timerDuration=this.state.remainingSeconds}this.notifyStateChange()}resume(){!this.state.isPlaying||!this.state.isPaused||(this.state.isPaused=!1,this.startCurrentStep(),this.notifyStateChange())}next(){var e;this.state.isPlaying&&(this.clearTimer(),((e=this.getCurrentStep())==null?void 0:e.type)==="timer"&&x(),this.advanceToNextStep())}stop(){this.clearTimer(),this.state.isPlaying=!1,this.state.isPaused=!1,this.resetTimerState(),R(!1),ee(),this.notifyStateChange()}completeRepsStep(){const e=this.getCurrentStep();(e==null?void 0:e.type)==="reps"&&this.state.isPlaying&&(x(),this.advanceToNextStep())}getState(){return{...this.state}}getCurrentStep(){return this.state.flatSteps[this.state.currentStepIndex]??null}onUpdate(e){this.onStateChange=e}startCurrentStep(){const e=this.getCurrentStep();if(!e){this.completeWorkout();return}e.type==="timer"?this.startTimer(e):(this.resetTimerState(),this.notifyStateChange())}startTimer(e){const t=this.state.timerDuration??e.durationSeconds;this.state.stepStartedAt=Date.now(),this.state.timerDuration=t,this.state.remainingSeconds=t,this.timerIntervalId=window.setInterval(()=>this.updateTimer(),100),this.notifyStateChange()}updateTimer(){const e=this.state.remainingSeconds,t=this.computeRemaining();this.state.remainingSeconds=t;const n=e?Math.ceil(e):0,i=Math.ceil(t);n!==i&&i>=1&&i<=3&&M(),t<=0?this.onTimerComplete():this.notifyStateChange()}computeRemaining(){if(this.state.stepStartedAt===null||this.state.timerDuration===null)return 0;const e=(Date.now()-this.state.stepStartedAt)/1e3;return Math.max(0,this.state.timerDuration-e)}onTimerComplete(){this.clearTimer(),this.state.remainingSeconds=0,x(),this.advanceToNextStep()}advanceToNextStep(){this.state.currentStepIndex++,this.state.isPaused=!1,this.state.currentStepIndex>=this.state.flatSteps.length?this.completeWorkout():(this.resetTimerState(),this.startCurrentStep())}completeWorkout(){this.stop(),this.notifyStateChange()}setupVisibilityListener(){document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&this.state.isPlaying&&!this.state.isPaused){Z();const e=this.getCurrentStep();(e==null?void 0:e.type)==="timer"&&(this.computeRemaining()<=0?this.onTimerComplete():this.notifyStateChange())}})}notifyStateChange(){var e;(e=this.onStateChange)==null||e.call(this,this.getState())}}class ne{constructor(e){m(this,"appElement");m(this,"currentView","landing");m(this,"callbacks",null);m(this,"lastStepIndex",-1);m(this,"lastPauseState",!1);this.appElement=e}showLanding(e,t,n,i){var f,S,b,w;this.currentView="landing";const r=i!==void 0?'<button type="button" id="view-schema-btn" class="secondary">View JSON Schema</button>':"",o=i!==void 0?`
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

        <div class="button-group">
          <button type="button" id="load-sample-btn" class="secondary">Load Sample</button>
          ${r}
          <button id="start-btn" class="primary">Validate & Preview</button>
        </div>
        ${o}

        <div class="version">v1.0.1</div>
      </div>
    `,i!==void 0){const d=document.getElementById("schema-dialog-code");d&&(d.textContent=i);const l=document.getElementById("schema-dialog"),v=document.getElementById("schema-dialog-copy"),J="Copy",F=async()=>{var L;try{if((L=navigator.clipboard)!=null&&L.writeText)return await navigator.clipboard.writeText(i),!0}catch{}const u=document.createElement("textarea");u.value=i,u.setAttribute("readonly",""),u.style.position="fixed",u.style.left="-9999px",document.body.appendChild(u),u.select();try{return document.execCommand("copy")}catch{return!1}finally{document.body.removeChild(u)}};(f=document.getElementById("view-schema-btn"))==null||f.addEventListener("click",()=>{l==null||l.showModal()}),(S=document.getElementById("schema-dialog-close"))==null||S.addEventListener("click",()=>{l==null||l.close()}),v==null||v.addEventListener("click",()=>{F().then(u=>{v&&u&&(v.textContent="Copied!",window.setTimeout(()=>{v.textContent=J},2e3))})})}const a=document.getElementById("workout-json"),p=document.getElementById("error-message"),c=document.getElementById("duration-estimate");n&&(a.value=n,a.dispatchEvent(new Event("input"))),a.addEventListener("input",()=>{try{const d=a.value.trim();if(d){const l=JSON.parse(d),v=C(l);c.textContent=`Estimated duration: ${E(T(v))}`,c.className="duration-estimate",p.textContent=""}else c.textContent=""}catch{c.textContent=""}}),(b=document.getElementById("start-btn"))==null||b.addEventListener("click",()=>{const d=a.value.trim();if(!d){p.textContent="Please enter workout JSON";return}try{e(d)}catch(l){p.textContent=l instanceof Error?l.message:"Invalid workout"}}),(w=document.getElementById("load-sample-btn"))==null||w.addEventListener("click",t)}showPreview(e,t,n,i){var a,p,c;this.currentView="preview";const r=T(t),o=this.stepsTreeHasNotes(e.steps);this.appElement.innerHTML=`
      <div class="preview">
        <h1 class="preview-title">${e.title}</h1>
        ${e.description?`<p class="preview-description">${e.description}</p>`:""}
        ${(a=e.equipment)!=null&&a.length?`<p class="preview-equipment">Equipment: ${e.equipment.join(", ")}</p>`:""}
        <p class="preview-duration">Estimated duration: ${E(r)} · ${t.length} steps</p>
        <ul class="preview-steps">
          ${this.renderPreviewStepsTree(e.steps)}
        </ul>
        ${o?'<p class="preview-notes-hint">Tap a step with notes to see coaching cues.</p>':""}
        <div class="preview-actions">
          <button id="preview-back-btn" class="secondary large">Back to edit</button>
          <button id="preview-start-btn" class="primary large">Start workout</button>
        </div>
      </div>
    `,(p=document.getElementById("preview-back-btn"))==null||p.addEventListener("click",n),(c=document.getElementById("preview-start-btn"))==null||c.addEventListener("click",i)}stepsTreeHasNotes(e){for(const t of e)if(t.notes||t.type==="group"&&this.stepsTreeHasNotes(t.steps))return!0;return!1}renderPreviewStepsTree(e){return e.map(t=>{if(t.type==="timer")return t.notes?`
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
        </li>`}).join("")}showCountdown(e,t){this.currentView="countdown",q();const n=t?`<div class="next-preview countdown-next-preview">${this.renderNextPreview(t)}</div>`:"",r=/iPad|iPhone|iPod/.test(navigator.userAgent)?'<p class="silent-mode-hint">Turn off silent mode for audio cues</p>':"";this.appElement.innerHTML=`
      <div class="countdown">
        <div class="countdown-number" id="countdown-number">3</div>
        <p class="countdown-label">Get ready</p>
        ${r}
        ${n}
      </div>
    `;let o=3;const a=document.getElementById("countdown-number"),p=this.appElement.querySelector(".countdown-label"),c=()=>{o>0?(a&&(a.textContent=String(o)),M(),o--,setTimeout(c,1e3)):(a&&(a.textContent="Go!"),p&&(p.textContent=""),x(),setTimeout(e,400))};c()}showPlayer(e,t,n,i,r,o){this.callbacks={onPause:t,onResume:n,onNext:i,onComplete:r,onEnd:o},this.currentView!=="player"?(this.currentView="player",this.lastStepIndex=-1,this.lastPauseState=!1,this.renderPlayer(e)):this.updatePlayer(e)}renderPlayer(e){var t;this.appElement.innerHTML=`
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
    `,(t=document.getElementById("end-btn"))==null||t.addEventListener("click",()=>{var n;return(n=this.callbacks)==null?void 0:n.onEnd()}),this.updatePlayer(e)}updatePlayer(e){const{workout:t,flatSteps:n,currentStepIndex:i,isPaused:r,remainingSeconds:o}=e;if(!t)return;const a=i!==this.lastStepIndex,p=r!==this.lastPauseState;if(this.lastStepIndex=i,this.lastPauseState=r,a||p)this.fullUpdate(e);else{const c=n[i];if((c==null?void 0:c.type)==="timer"&&o!==null){const f=document.querySelector(".timer");f&&(f.textContent=N(o))}}}fullUpdate(e){const{workout:t,flatSteps:n,currentStepIndex:i,isPaused:r,remainingSeconds:o}=e;if(!t)return;const a=n[i],p=n[i+1],c=document.getElementById("workout-title");c&&(c.textContent=t.title);const f=document.getElementById("progress-fill"),S=document.getElementById("progress-text");if(f&&S){const l=n.length>0?i/n.length*100:0;f.style.width=`${l}%`,S.textContent=`Step ${Math.min(i+1,n.length)} of ${n.length}`}const b=document.getElementById("step-content");b&&(b.innerHTML=a?this.renderStep(a,o):'<div class="complete"><h2>Workout Complete!</h2><p>Great job!</p></div>');const w=document.getElementById("next-preview");w&&(p?w.innerHTML=this.renderNextPreview(p):w.innerHTML='<p class="next-preview-last">Last step!</p>');const d=document.getElementById("controls");d&&a&&(d.innerHTML=this.renderControls(a,r),this.attachControlListeners(a,r))}renderNextPreview(e){const t=e.type==="timer"?E(e.durationSeconds):`× ${e.reps} reps`;let n=`
      <p class="next-preview-label">Up next</p>
      <p class="next-preview-name">${e.name}</p>
      <p class="next-preview-meta">${t}</p>`;return e.notes&&(n+=`<p class="next-preview-notes">${e.notes}</p>`),n}renderStep(e,t){const n=['<div class="step">'];if(e.roundContext){const{groupName:i,currentRound:r,totalRounds:o}=e.roundContext;n.push(`<div class="round-context">${i} — Round ${r} of ${o}</div>`)}if(n.push(`<h2 class="step-name">${e.name}</h2>`),e.type==="timer"){const i=t??e.durationSeconds;n.push(`<div class="timer">${N(i)}</div>`)}else n.push(`<div class="reps">× ${e.reps} reps</div>`);return e.notes&&n.push(`<p class="notes">${e.notes}</p>`),n.push("</div>"),n.join("")}renderControls(e,t){return e.type==="timer"?`${t?'<button id="resume-btn" class="primary large">Resume</button>':'<button id="pause-btn" class="primary large">Pause</button>'}<button id="next-btn" class="secondary">Skip</button>`:'<button id="complete-btn" class="primary large">Done</button>'}attachControlListeners(e,t){var n,i,r,o;this.callbacks&&(e.type==="timer"?(t?(n=document.getElementById("resume-btn"))==null||n.addEventListener("click",this.callbacks.onResume):(i=document.getElementById("pause-btn"))==null||i.addEventListener("click",this.callbacks.onPause),(r=document.getElementById("next-btn"))==null||r.addEventListener("click",this.callbacks.onNext)):(o=document.getElementById("complete-btn"))==null||o.addEventListener("click",this.callbacks.onComplete))}showError(e){const t=document.getElementById("error-message");t&&(t.textContent=e,t.className="error visible")}loadSampleIntoTextarea(e){const t=document.getElementById("workout-json");t&&(t.value=e,t.dispatchEvent(new Event("input")))}}const ie="https://json-schema.org/draft/2020-12/schema",re="https://workout-player.pages.dev/schemas/workout-playback.json",oe="Workout Playback Format",ae="Format for workouts that the player app consumes",ce="object",pe=["version","title","steps"],le={version:{type:"number",const:1,description:"Schema version (must be 1)"},title:{type:"string",minLength:1,description:"Workout title"},description:{type:"string",description:"Optional workout description"},equipment:{type:"array",items:{type:"string"},description:"Equipment needed for the workout"},skipLastRest:{type:"boolean",description:"Skip the last rest step at the end of the workout"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Array of workout steps"}},de={step:{oneOf:[{$ref:"#/$defs/timerStep"},{$ref:"#/$defs/repsStep"},{$ref:"#/$defs/groupStep"}]},timerStep:{type:"object",required:["id","type","name","durationSeconds"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"timer"},name:{type:"string",minLength:1,description:"Step name (e.g., Warm up, Rest)"},durationSeconds:{type:"number",minimum:1,description:"Duration in seconds"},rest:{type:"boolean",description:"Mark as rest for skipLastRest logic"},notes:{type:"string",description:"Optional coaching cues or notes"}}},repsStep:{type:"object",required:["id","type","name","reps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"reps"},name:{type:"string",minLength:1,description:"Exercise name (e.g., Push-ups, Squats)"},reps:{type:"number",minimum:1,description:"Number of repetitions"},estimatedDurationSeconds:{type:"number",minimum:1,description:"Optional estimated duration in seconds for total workout time estimation"},notes:{type:"string",description:"Optional coaching cues or notes"}}},groupStep:{type:"object",required:["id","type","name","rounds","steps"],properties:{id:{type:"string",description:"Unique step identifier"},type:{const:"group"},name:{type:"string",minLength:1,description:"Group name (e.g., Circuit 1)"},rounds:{type:"number",minimum:1,description:"Number of rounds to repeat"},skipLastRest:{type:"boolean",description:"Skip the last rest step in each round"},steps:{type:"array",minItems:1,items:{$ref:"#/$defs/step"},description:"Steps to repeat for each round"},notes:{type:"string",description:"Optional notes about the group"}}}},ue={$schema:ie,$id:re,title:oe,description:ae,type:ce,required:pe,properties:le,$defs:de},H=JSON.stringify(ue,null,2),me=document.querySelector("#app"),h=new se,y=new ne(me),he={version:1,title:"Circuit workout",description:"Warm up, 3 rounds of push-ups and squats with rest between, then cool down.",equipment:["bodyweight"],skipLastRest:!0,steps:[{id:"warmup",type:"timer",name:"Warm up",durationSeconds:90},{id:"circuit-1",type:"group",name:"Circuit 1",rounds:3,skipLastRest:!0,steps:[{id:"c1-pushups",type:"reps",name:"Push-ups",reps:10,estimatedDurationSeconds:30,notes:"Keep your core tight"},{id:"c1-rest1",type:"timer",name:"Rest",durationSeconds:30},{id:"c1-squats",type:"reps",name:"Squats",reps:12,estimatedDurationSeconds:40,notes:"Go deep!"},{id:"c1-rest2",type:"timer",name:"Rest",durationSeconds:30}]},{id:"cooldown",type:"timer",name:"Cool down",durationSeconds:60}]};function V(){y.showLanding(U,G,void 0,H)}function U(s){try{const e=z(s),t=C(e);y.showPreview(e,t,()=>y.showLanding(U,G,s,H),()=>y.showCountdown(()=>fe(e),t[0]??null))}catch(e){y.showError(e instanceof Error?e.message:"Invalid workout")}}function fe(s){h.loadWorkout(s),h.start();const e=()=>{y.showPlayer(h.getState(),()=>h.pause(),()=>h.resume(),()=>h.next(),()=>h.completeRepsStep(),ve)};h.onUpdate(e),e()}function G(){y.loadSampleIntoTextarea(JSON.stringify(he,null,2))}function ve(){h.stop(),V()}V();
