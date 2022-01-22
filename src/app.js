App = {
	loading: false,
	contracts: {},

	load: async () => {
		await App.loadWeb3()
		await App.loadAccount()
		await App.loadContract()
		await App.render()
	},

	// https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
	loadWeb3: async () => {
		window.addEventListener('load', async () => {
			// Modern dapp browsers...
			if (window.ethereum) {
				console.log(111)
				window.ethereum = new Web3(ethereum);
				console.log(window.ethereum)
				try {
					// Request account access if needed
					await ethereum.enable();
					// Acccounts now exposed
					web3.eth.sendTransaction({/* ... */ });
				} catch (error) {
					console.log(err)
					// User denied account access...
				}
			}
			// Legacy dapp browsers...
			else if (window.web3) {
				window.web3 = new Web3(web3.currentProvider);
				// Acccounts always exposed
				web3.eth.sendTransaction({/* ... */ });
			}
			// Non-dapp browsers...
			else {
				console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
			}
		});
	},
	loadAccount: async () => {
		a = await window.ethereum.enable()
		account = await window.ethereum.request({ method: 'eth_accounts' })
		App.account = account
	},
	loadContract: async () => {
		const todoList = await $.getJSON('TodoList.json');
		App.contracts.TodoList = TruffleContract(todoList);
		App.contracts.TodoList.setProvider(web3.currentProvider)
		App.todoList = await App.contracts.TodoList.deployed()
	},
	render: async () => {

		if (App.loading) {
			return
		}

		App.setLoading(true)

		$('#account').html(App.account)
		await App.renderTasks()

		App.setLoading(false)
	},
	setLoading: (boolean) => {
		App.loading = boolean
		const loader = $('#loader')
		const content = $('#content')
		if (boolean) {
			loader.show()
			content.hide()
		} else {
			loader.hide()
			content.show()
		}
	},
	toggleCompleted: async (e) => {

		App.setLoading(true);
		const tastId = e.target.name
		await App.todoList.toggleCompleted(tastId, { from: App.account[0] })
		window.location.reload()

	},
	createTask: async () => {
		App.setLoading(true)
		const content = $("#newTask").val()
		console.log(content.toLowerCase)
		console.log(App.account[0])
		await App.todoList.createTask(content, { from: App.account[0] })
		window.location.reload()
	},
	renderTasks: async () => {

		const taskCount = await App.todoList.taskCount()
		const $taskTemplate = $('.taskTemplate')

		for (var i = 1; i <= taskCount; i++) {
			const task = await App.todoList.tasks(i)
			const taskId = task[0].toNumber()
			const taskContent = task[1]
			const taskCompleted = task[2]

			const $newTaskTemplate = $taskTemplate.clone()
			$newTaskTemplate.find('.content').html(taskContent)
			$newTaskTemplate.find('input')
				.prop('name', taskId)
				.prop('checked', taskCompleted)
				.on('click', App.toggleCompleted)
			if (taskCompleted) {
				$('#completedTaskList').append($newTaskTemplate)
			} else {
				$('#taskList').append($newTaskTemplate)
			}

			// Show the task
			$newTaskTemplate.show()
		}


	},
}


$(() => {
	$(window).load(() => {
		App.load()
	})
})