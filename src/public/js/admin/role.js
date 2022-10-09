$('.alert .close').click(function () {
	$('#error-msg').addClass('hide')
})
$('#send-modal').on('hidden.bs.modal', function () {
	$(this).find('form').trigger('reset')
	$('#error-msg-name').text('')
	$('#error-msg').addClass('hide')
	$('#error-msg-role').text('')
})

function addRole() {
	let data = {}
	let roleName = $('#role-name').val()
	let adminManagement
	let orderManagement
	let roleManagement
	let userManagement
	let nftManagement
	let transactionManagement
	let contentManagement
	let creatorManagement
	let notificationManagement

	if ($('#adminManagement').is(':checked')) {
		adminManagement = true
	} else {
		adminManagement = false
	}

	if ($('#orderManagement').is(':checked')) {
		orderManagement = true
	} else {
		orderManagement = false
	}

	if ($('#userManagement').is(':checked')) {
		userManagement = true
	} else {
		userManagement = false
	}

	if ($('#creatorManagement').is(':checked')) {
		creatorManagement = true
	} else {
		creatorManagement = false
	}

	if ($('#nftManagement').is(':checked')) {
		nftManagement = true
	} else {
		nftManagement = false
	}

	if ($('#contentManagement').is(':checked')) {
		contentManagement = true
	} else {
		contentManagement = false
	}

	if ($('#roleManagement').is(':checked')) {
		roleManagement = true
	} else {
		roleManagement = false
	}

	if ($('#transactionManagement').is(':checked')) {
		transactionManagement = true
	} else {
		transactionManagement = false
	}

	if ($('#notificationManagement').is(':checked')) {
		notificationManagement = true
	} else {
		notificationManagement = false
	}

	data.roleName = roleName.trim()
	data.adminManagement = adminManagement
	data.orderManagement = orderManagement
	data.userManagement = userManagement
	data.nftManagement = nftManagement
	data.contentManagement = contentManagement
	data.creatorManagement = creatorManagement
	data.transactionManagement = transactionManagement
	data.roleManagement = roleManagement
	data.notificationManagement = notificationManagement
	if (!data.roleName) {
		$('#error-msg-name').text('Please provide role name.')
		$('#error-msg-role').text('')
	} else if (data.roleName.length < 4) {
		$('#error-msg-name').text('Role name should be longer than atleast 3 characters.')
		$('#error-msg-role').text('')
	} else if (!Object.values(data).some((val) => val === true)) {
		$('#error-msg-role').text('Please provide at least one permission.')
		$('#error-msg-name').text('')
	} else {
		$.ajax({
			url: `${window.location.origin}/api/v1/admin/createRole`,
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			success: function (data) {
				$('#error-msg-role').text('')
				$('#error-msg-name').text('')
				$('#send-modal').modal('hide')
				$('#modal-admin-success').modal('show')
				$('#modal-admin-success').on('hidden.bs.modal', () => {
					window.location.reload()
				})
			},
			error: function (error) {
				$('#error-msg-role').text('')
				$('#error-msg-name').text('')
				$('#error-msg1').text('')
				$('#error-msg1').text(error.responseJSON.msg)
				$('#error-msg').removeClass('hide')
			},
		})
	}
}

$('#modal-delete').on('show.bs.modal', function (e) {
	let btn = $(e.relatedTarget)
	let roleId = btn.data('href')
	$('#delete-role')
		.off()
		.on('click', (e) => {
			$.ajax({
				url: `${window.location.origin}/api/v1/admin/deleteRole/${roleId}`,
				type: 'DELETE',
				success: function (data) {
					$('#modal-success').modal('show')
					$('#modal-success').on('hidden.bs.modal', function () {
						window.location.reload()
					})
				},
				error: function (err) {
					toastr.error(err.responseJSON.msg, 'Error')
				},
			})
		})
})

$('#edit-modal').on('hidden.bs.modal', function () {
	$(this).find('form').trigger('reset')
	$('#error-msg').addClass('hide')
	$('#error-msg-editName').text('')
	$('#error-msg-editRole').text('')
})

// GET ROLE DETAILS
$('#edit-modal').on('show.bs.modal', function (e) {
	var button = $(e.relatedTarget)
	var nft = button.data('nft')
	var role = button.data('role')
	var user = button.data('user')
	var admin = button.data('admin')
	var order = button.data('order')
	var roleId = button.data('id')
	var creator = button.data('creator')
	var content = button.data('content')
	var rolename = button.data('name')
	var transaction = button.data('transaction')
	var notification = button.data('notification')
	if (admin) {
		$("input[name='adminManagement']").attr('checked', true)
	} else {
		$("input[name='adminManagement']").attr('checked', false)
	}
	if (order) {
		$("input[name='order']").attr('checked', true)
	} else {
		$("input[name='order']").attr('checked', false)
	}
	if (user) {
		$("input[name='user']").attr('checked', true)
	} else {
		$("input[name='user']").attr('checked', false)
	}
	if (content) {
		$("input[name='content']").attr('checked', true)
	} else {
		$("input[name='content']").attr('checked', false)
	}
	if (nft) {
		$("input[name='nft']").attr('checked', true)
	} else {
		$("input[name='nft']").attr('checked', false)
	}
	if (transaction) {
		$("input[name='transaction']").attr('checked', true)
	} else {
		$("input[name='transaction']").attr('checked', false)
	}
	if (role) {
		$("input[name='role']").attr('checked', true)
	} else {
		$("input[name='role']").attr('checked', false)
	}
	if (creator) {
		$("input[name='creator']").attr('checked', true)
	} else {
		$("input[name='creator']").attr('checked', false)
	}
	if (notification) {
		$("input[name='notification']").attr('checked', true)
	} else {
		$("input[name='notification']").attr('checked', false)
	}
	$('#editRole').val(rolename)
	$('#roleId').val(roleId)

	$('input[name="adminManagement"]').change(function () {
		if ($(this).is(':checked')) {
			admin = true
		} else {
			admin = false
		}
	})
	$("input[name='order']").change(function () {
		if ($(this).is(':checked')) {
			order = true
		} else {
			order = false
		}
	})
	$("input[name = 'role']").change(function () {
		if ($(this).is(':checked')) {
			role = true
		} else {
			role = false
		}
	})
	$("input[name='user']").change(function () {
		if ($(this).is(':checked')) {
			user = true
		} else {
			user = false
		}
	})
	$("input[name='nft']").change(function () {
		if ($(this).is(':checked')) {
			nft = true
		} else {
			nft = false
		}
	})
	$("input[name='content']").change(function () {
		if ($(this).is(':checked')) {
			content = true
		} else {
			content = false
		}
	})
	$("input[name='notification']").change(function () {
		if ($(this).is(':checked')) {
			notification = true
		} else {
			notification = false
		}
	})
	$("input[name='creator']").change(function () {
		if ($(this).is(':checked')) {
			creator = true
		} else {
			creator = false
		}
	})
	$("input[name='transaction']").change(function () {
		if ($(this).is(':checked')) {
			transaction = true
		} else {
			transaction = false
		}
	})

	$('#update-role-data')
		.off()
		.on('click', function () {
			// alert($('#roleId').val())
			rolename = $('#editRole').val()
			let data = {}
			data.roleName = rolename.trim()
			data.adminManagement = admin
			data.orderManagement = order
			data.userManagement = user
			data.nftManagement = nft
			data.contentManagement = content
			data.creatorManagement = creator
			data.transactionManagement = transaction
			data.roleManagement = role
			data.notificationManagement = notification
			if (!data.roleName) {
				$('#error-msg-editName').text('Role name cannot be empty.')
			} else if (data.roleName.length < 3) {
				$('#error-msg-editName').text('Role name must be at least 3 characters long.')
				$('#error-msg-editRole').text('')
			} else if (!Object.values(data).some((val) => val === true)) {
				$('#error-msg-editRole').text('Please provide atleast one permission.')
				$('#error-msg-editName').text('')
			} else {
				$('#edit-modal').modal('hide')
				$('#modal-edit-success').modal('show')
				$('#modal-edit-success').on('shown.bs.modal', () => {
					$('#updateRole')
						.off('click')
						.on('click', function () {
							$.ajax({
								url: `${window.location.origin}/api/v1/admin/editRole/${roleId}`,
								type: 'PUT',
								contentType: 'application/json',
								data: JSON.stringify(data),
								success: (data) => {
									$('#edit-admin-success').modal('show')
									$('#edit-admin-success').on('hidden.bs.modal', () => {
										window.location.reload()
									})
								},
								error: (err) => {
									$('#error-msg-editRole').text('')
									$('#error-msg-editName').text('')
									$('#modal-edit-success').modal('hide')
									// $('#edit-modal').modal('show')
									$(`#${  $('#roleId').val()}`).trigger("click");
									toastr.error(err.responseJSON.msg, 'Error')
								},
							})
						})
				})
			}
		})
})
