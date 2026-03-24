// Form validation
document.addEventListener('DOMContentLoaded', function () {
    // Auto-dismiss alerts after 5 seconds
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            setTimeout(() => bsAlert.close(), 3000);
        });
    }, 5000);

    // Confirm delete actions
    const deleteForms = document.querySelectorAll('form[action*="DELETE"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });
});

// Update total price in booking form
function updateTotalPrice(pricePerPerson) {
    const people = document.getElementById('number_of_people');
    const totalSpan = document.getElementById('total_price');

    if (people && totalSpan) {
        const total = people.value * pricePerPerson;
        totalSpan.textContent = total;
    }
}

// Search tours with debounce
let searchTimeout;
function searchTours() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const searchValue = searchInput.value;
            window.location.href = `/tours?search=${encodeURIComponent(searchValue)}`;
        }
    }, 500);
}