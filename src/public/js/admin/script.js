$(document).ready(function () {
	$('body').tooltip({ selector: '[data-toggle=tooltip]' })
})
$("input[type='text'], input[type='password'], input[type='number'], textarea[type='text']").keypress(function () {
	if ($(this).val().length > 255) {
		toastr.warning('Maximum 256 characters are allowed.', 'Warning!')
		return false
	}
})