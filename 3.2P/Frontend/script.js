async function loadSockets() {
  const res = await fetch('http://localhost:3000/api/sockets');
  const sockets = await res.json();
  const list = document.getElementById('socket-list');
  list.innerHTML = '';
  sockets.forEach(socket => {
      list.innerHTML += `
          <li class="collection-item">
              Location: ${socket.location} | Power: ${socket.power} | ${socket.available ? 'Available' : 'Occupied'}
              <button class="btn right" onclick='showDetails(${JSON.stringify(socket)})'>Reserve</button>
          </li>`;
  });
}

function showDetails(socket) {
  document.getElementById('socket-details').innerHTML = `
      <p><strong>Location:</strong> ${socket.location}</p>
      <p><strong>Power:</strong> ${socket.power}</p>
      <p><strong>Status:</strong> ${socket.available ? 'Available' : 'Occupied'}</p>
      <input type="datetime-local" />
      <button class="btn">Reserve</button>
  `;
}

loadSockets();
