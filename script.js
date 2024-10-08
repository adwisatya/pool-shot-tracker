
document.addEventListener('DOMContentLoaded', function () {
  const poolButtons = document.querySelectorAll('.pool-button');
  const poolChartCanvas = document.getElementById('pool-chart');
  const todaypoolsBody = document.getElementById('today-pools-body');
  const historypoolsBody = document.getElementById('history-pools-body');

  let poolData = JSON.parse(localStorage.getItem('poolData')) || {};

  poolButtons.forEach(button => {
    button.addEventListener('click', function () {
      var gameName = document.getElementById('game-name').value;

      const pool = this.getAttribute('data-pool');
      const date = new Date().toISOString().split('T')[0];
      
      if (!poolData[date]) {
        poolData[date] = {};
      }
	  if (!poolData[date][gameName]) {
		poolData[date][gameName] = {}
	  }
      if (!poolData[date][gameName][pool]) {
        poolData[date][gameName][pool] = 1;
      } else {
        poolData[date][gameName][pool]++;
      }

      localStorage.setItem('poolData', JSON.stringify(poolData));
      updateChart();
      updateTodaypoolsTable();
    });
  });

  function updateChart() {
    const labels = [];
    const datasets = [];
    const dates = Object.keys(poolData).slice(-30);
	var total = {}
	total['pocket'] = []
	total['miss'] = []
	total['foul'] = []

    for (const date of dates) {
	  counter = {}
	  counter['pocket'] = 0
	  counter['miss'] = 0
	  counter['foul'] = 0
      labels.push(date);
      const data = poolData[date];
	  const games = Object.keys(data)
      for (const game of games) {
		  const emotions = Object.keys(data[game]);
		  for (const emotion of emotions) {
			counter[emotion] += data[game][emotion]
		  }
      }
	  for (const emotion of ['pocket','miss','foul']) {
		total[emotion].push(counter[emotion])
	  }
    }
	for (const emotion of ['pocket','miss','foul']) {
	  datasets.push({
		label: emotion,
		data: total[emotion],
		backgroundColor: getBackgroundColor(emotion),
	  });
	}
    const ctx = poolChartCanvas.getContext('2d');

    if (window.poolChart instanceof Chart) {
      window.poolChart.destroy();
    }

    window.poolChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });
  }

  function updateTodaypoolsTable() {
    todaypoolsBody.innerHTML = '';
	historypoolsBody.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const todaypools = poolData[today];
    if (todaypools) {
      Object.keys(todaypools).forEach(game => {
			const row = document.createElement('tr');
			row.innerHTML = `
			  <td>${game}</td>
			  <td>${todaypools[game]["miss"]}</td>
			  <td><span class="delete-btn" data-pool="miss" data-game="${game}">&times;</span></td>
			  <td>${todaypools[game]["pocket"]}</td>
			  <td><span class="delete-btn" data-pool="pocket" data-game="${game}">&times;</span></td>  
			  <td>${todaypools[game]["foul"]}</td>
			  <td><span class="delete-btn" data-pool="foul" data-game="${game}">&times;</span></td>  
			`;
			todaypoolsBody.appendChild(row);
      });
    }
	
	for (const hdate of Object.keys(poolData)){
		if (hdate != today) {
			historyData = poolData[hdate];
			Object.keys(historyData).forEach(game => {
					const row = document.createElement('tr');
					row.innerHTML = `
					  <td>${hdate}</td>
					  <td>${game}</td>
					  <td>${historyData[game]["miss"]}</td>
					  <td>${historyData[game]["pocket"]}</td>
					  <td>${historyData[game]["foul"]}</td>
					`;
					historypoolsBody.appendChild(row);
			  });
		}
	}
    addDeleteEventListeners();
  }

function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
	  const gameName = this.getAttribute('data-game');
      const pool = this.getAttribute('data-pool');
      const today = new Date().toISOString().split('T')[0];
      if (poolData[today][gameName] && poolData[today][gameName][pool]) {
        if (poolData[today][gameName][pool] > 1) {
          poolData[today][gameName][pool]--;
        } else {
          delete poolData[today][gameName][pool];
        }
		if ((poolData[today][gameName]["pocket"] == undefined) && (poolData[today][gameName]["miss"] ==undefined) && (poolData[today][gameName]["foul"] ==undefined)){
			delete poolData[today][gameName];
		}
        localStorage.setItem('poolData', JSON.stringify(poolData));
        updateTodaypoolsTable();
		updateChart();
      }
    });
  });
}


	function getBackgroundColor(emotion) {
	  switch (emotion) {
		case 'miss':
		  return '#6495ed';
		case 'pocket':
		  return '#ffd700';
		case 'foul':
		  return '#a87532';
		default:
		  return '#000'; // Default color if pool doesn't match
	  }
	}
// Initial update of chart and today's pools table
  updateChart();
  updateTodaypoolsTable();
})
