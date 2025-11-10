
(function(){

  const notificationSound = new Audio('https://actions.google.com/sounds/v1/alerts/crystal_bell_chime.ogg');
  notificationSound.volume = 0.7; 
  notificationSound.preload = 'auto'; 
  
  function testSound() {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(e => alert('Could not play sound. Please click somewhere on the page first and try again.'));
  }
  
  let notificationsEnabled = false;
  async function setupNotifications() {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission === "granted") {
        notificationsEnabled = true;
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        notificationsEnabled = permission === "granted";
      }
    } catch(e) { console.warn('Notifications not available:', e); }
  }
  
  const taskInput = document.getElementById('taskInput');
  const durationInput = document.getElementById('durationInput');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');
  const timerDisplay = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const currentTaskTitle = document.getElementById('currentTaskTitle');
  const progressBar = document.getElementById('progressBar');

  const volumeControl = document.createElement('input');
  volumeControl.type = 'range';
  volumeControl.min = '0';
  volumeControl.max = '100';
  volumeControl.value = '70';
  volumeControl.style.width = '100px';
  volumeControl.title = 'Notification Volume';
  volumeControl.addEventListener('input', (e) => {
    notificationSound.volume = parseInt(e.target.value) / 100;
  });
  
  const footer = document.querySelector('.app-footer');
  const volumeWrap = document.createElement('div');
  volumeWrap.style.marginTop = '10px';
    volumeWrap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;color:#cdd3df">
        <label style="display:flex;align-items:center;gap:8px"><span>🔊</span></label>
        <button class="btn" onclick="testSound()" style="padding:4px 8px;font-size:0.9em">Test Sound 🔔</button>
      </div>
    `;
  volumeWrap.querySelector('label').appendChild(volumeControl);
  footer.appendChild(volumeWrap);

  let tasks = [];
  let currentId = null; 
  let timer = null; 

  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function save(){localStorage.setItem('study_tasks', JSON.stringify(tasks))}
  function load(){try{tasks = JSON.parse(localStorage.getItem('study_tasks')||'[]')}catch(e){tasks=[]}}
  function formatTime(s){
    const m = Math.floor(s/60).toString().padStart(2,'0');
    const sec = (s%60).toString().padStart(2,'0');
    return `${m}:${sec}`;
  }

  function renderTasks(){
    taskList.innerHTML = '';
    tasks.forEach(t => {
      const li = document.createElement('li'); li.className='task-item';
      const left = document.createElement('div'); left.className='task-left';
      const title = document.createElement('div'); title.className='task-title';
      title.textContent = t.title;
      const meta = document.createElement('div'); meta.className='task-meta';
      const minutes = Math.ceil((t.remainingSec || t.durationMin*60)/60);
      meta.textContent = `${t.durationMin} min • ${t.completed? 'Done' : minutes + ' min left'}`;
      left.appendChild(title); left.appendChild(meta);

      const actions = document.createElement('div'); actions.className='task-actions';
      const select = document.createElement('button'); select.className='btn'; select.textContent='Select';
      select.onclick = ()=>selectTask(t.id);
      const done = document.createElement('button'); done.className='btn'; done.textContent = t.completed? 'Undo' : 'Complete';
      done.onclick = ()=>{ toggleComplete(t.id); };
      const del = document.createElement('button'); del.className='btn'; del.textContent='Delete';
      del.onclick = ()=>{ deleteTask(t.id); };

      actions.appendChild(select); actions.appendChild(done); actions.appendChild(del);
      li.appendChild(left); li.appendChild(actions);
      taskList.appendChild(li);
    })
  }

  function addTask(){
    const title = taskInput.value.trim();
    const durationMin = Math.max(1, parseInt(durationInput.value,10) || 25);
    if(!title) return;
    const t = {id:uid(), title, durationMin, remainingSec: durationMin*60, completed:false, createdAt:Date.now()}
    tasks.unshift(t);
    save(); renderTasks();
    taskInput.value='';
  }

  function deleteTask(id){
    if(currentId === id){ stopTimer(); currentId = null }
    tasks = tasks.filter(t=>t.id!==id); save(); renderTasks(); updateTimerUI();
  }

  function toggleComplete(id){
    const t = tasks.find(x=>x.id===id); if(!t) return; t.completed = !t.completed;
    if(t.completed) t.remainingSec = 0; else t.remainingSec = t.durationMin*60;
    save(); renderTasks(); updateTimerUI();
  }

  function selectTask(id){
    currentId = id; updateTimerUI();
  }

  function updateTimerUI(){
    const t = tasks.find(x=>x.id===currentId);
    if(!t){ currentTaskTitle.textContent='No task selected'; timerDisplay.textContent='00:00'; progressBar.style.width='0%'; return; }
    currentTaskTitle.textContent = t.title;
    const remaining = Math.max(0, t.remainingSec || t.durationMin*60);
    timerDisplay.textContent = formatTime(remaining);
    const total = t.durationMin*60 || 1;
    const pct = Math.min(100, Math.round((1 - (remaining/total)) * 100));
    progressBar.style.width = pct + '%';
  }

  function showNotification(title, body) {
    try {
      notificationSound.currentTime = 0; 
      notificationSound.play().catch(e => console.warn('Could not play notification sound:', e));
    } catch(e) { console.warn('Audio playback failed:', e); }
    
    if (!notificationsEnabled) return;
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        requireInteraction: true,
        silent: true 
      });
    } catch(e) { console.warn('Failed to show notification:', e); }
  }

  function tick(){
    if(!currentId) return stopTimer();
    const t = tasks.find(x=>x.id===currentId);
    if(!t) return stopTimer();
    if(t.completed) return stopTimer();
    t.remainingSec = Math.max(0, (t.remainingSec || t.durationMin*60) - 1);
    if(t.remainingSec === 0){ 
      t.completed = true; 
      stopTimer(); 
      flashDone();
      showNotification('Study Timer Complete! 🎉', `Task "${t.title}" is finished`);
    }
    save(); updateTimerUI(); renderTasks();
  }

  function startTimer(){ if(!currentId) return; if(timer) return; timer = setInterval(tick,1000); }
  function pauseTimer(){ if(timer){ clearInterval(timer); timer = null } }
  function stopTimer(){ if(timer){ clearInterval(timer); timer=null } }
  function resetTimer(){
    if(!currentId) return;
    const t = tasks.find(x=>x.id===currentId); if(!t) return;
    t.remainingSec = t.durationMin*60; t.completed = false; save(); updateTimerUI(); renderTasks();
  }

  function flashDone(){
    const el = timerDisplay; el.style.transition='none'; el.style.transform='scale(1.08)'; setTimeout(()=>{el.style.transition='transform 220ms'; el.style.transform='scale(1)';},220);
  }

  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', e=>{ if(e.key==='Enter') addTask(); });
  startBtn.addEventListener('click', ()=>startTimer());
  pauseBtn.addEventListener('click', ()=>pauseTimer());
  resetBtn.addEventListener('click', ()=>resetTimer());

  setupNotifications();
  load(); renderTasks();

  const first = tasks.find(t=>!t.completed) || tasks[0];
  if(first) currentId = first.id;
  updateTimerUI();

  window.addEventListener('beforeunload', ()=>{ save(); });

})();
