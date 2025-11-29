// Wait for DOM to load
$(document).ready(function () {

    // Form Validation Rules
    const validationRules = {
        firstName: {
            required: true,
            minLength: 1,
            pattern: /^[a-zA-Z\s]+$/,
            errorMessage: 'Please enter a valid first name (letters only, min 2 characters)'
        },
        lastName: {
            required: true,
            minLength: 1,
            pattern: /^[a-zA-Z\s]+$/,
            errorMessage: 'Please enter a valid last name (letters only, min 1 character)'
        }
        ,
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: 'Please enter a valid email address'
        },
        phone: {
            required: true,
            pattern: /^[0-9]{10}$/,
            errorMessage: 'Please enter a valid 10-digit phone number'
        },
        pincode: {
            required: true,
            pattern: /^[0-9]{6}$/,
            errorMessage: 'Please enter a valid 6-digit pincode'
        }
    };

    // Real-time Validation
    $('input, select, textarea').on('blur', function () {
        validateField($(this));
    });

    // Validate individual field
    function validateField(field) {
        const fieldName = field.attr('name');
        const fieldValue = field.val().trim();
        const errorSpan = $('#' + field.attr('id') + 'Error');

        // Check if field has validation rules
        if (validationRules[fieldName]) {
            const rules = validationRules[fieldName];

            // Required validation
            if (rules.required && !fieldValue) {
                showError(field, errorSpan, 'This field is required');
                return false;
            }

            // Min length validation
            if (rules.minLength && fieldValue.length < rules.minLength) {
                showError(field, errorSpan, rules.errorMessage || `Minimum ${rules.minLength} characters required`);
                return false;
            }

            // Pattern validation
            if (rules.pattern && fieldValue && !rules.pattern.test(fieldValue)) {
                showError(field, errorSpan, rules.errorMessage);
                return false;
            }

            // If all validations pass
            clearError(field, errorSpan);
            return true;
        }

        return true;
    }

    // Show error message
    function showError(field, errorSpan, message) {
        field.addClass('error');
        errorSpan.text(message);
    }

    // Clear error message
    function clearError(field, errorSpan) {
        field.removeClass('error');
        errorSpan.text('');
    }

    // Form Submit Handler with AJAX
    $('#registrationForm').on('submit', function (e) {
        e.preventDefault();

        // Validate all fields before submission
        let isValid = true;
        $('input[required], select[required], textarea[required]').each(function () {
            if (!validateField($(this))) {
                isValid = false;
            }
        });

        // Check terms and conditions
        if (!$('#terms').is(':checked')) {
            showError($('#terms'), $('#termsError'), 'You must agree to terms and conditions');
            isValid = false;
        }

        if (!isValid) {
            $('html, body').animate({
                scrollTop: $('.error').first().offset().top - 100
            }, 500);
            return false;
        }

        // Show loading spinner
        $('#loadingSpinner').fadeIn();
        $('#registrationForm').hide();

        // Prepare form data
        const formData = new FormData(this);

        // AJAX submission
        $.ajax({
            url: 'process.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function (response) {
                $('#loadingSpinner').fadeOut();

                if (response.success) {
                    // Hide form container
                    $('.form-container').fadeOut(function () {
                        // Display submitted data
                        displaySubmittedData(response.data);
                        $('#displayArea').fadeIn();
                    });
                } else {
                    // Show error message
                    $('#formMessage')
                        .removeClass('success')
                        .addClass('error')
                        .html('<i class="fas fa-exclamation-circle"></i> ' + response.message)
                        .fadeIn();
                    $('#registrationForm').fadeIn();
                }
            },
            error: function (xhr, status, error) {
                $('#loadingSpinner').fadeOut();
                $('#formMessage')
                    .removeClass('success')
                    .addClass('error')
                    .html('<i class="fas fa-exclamation-circle"></i> An error occurred. Please try again.')
                    .fadeIn();
                $('#registrationForm').fadeIn();
                console.error('Error:', error);
            }
        });
    });

    // Display Submitted Data Function
    function displaySubmittedData(data) {
        const applicationId = 'APP' + Date.now();
        $('#applicationId').text(applicationId);

        let displayHTML = '';

        // Personal Information
        displayHTML += `
            <div class="display-section">
                <h3><i class="fas fa-user"></i> Personal Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Full Name</div>
                        <div class="info-value">${data.firstName} ${data.lastName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date of Birth</div>
                        <div class="info-value">${formatDate(data.dob)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Gender</div>
                        <div class="info-value">${capitalizeFirst(data.gender)}</div>
                    </div>
                </div>
            </div>
        `;

        // Contact Information
        displayHTML += `
            <div class="display-section">
                <h3><i class="fas fa-address-book"></i> Contact Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${data.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${data.phone}</div>
                    </div>
                    ${data.altPhone ? `
                    <div class="info-item">
                        <div class="info-label">Alternate Phone</div>
                        <div class="info-value">${data.altPhone}</div>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-label">Address</div>
                        <div class="info-value">${data.address}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">City</div>
                        <div class="info-value">${data.city}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">State</div>
                        <div class="info-value">${data.state}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Pincode</div>
                        <div class="info-value">${data.pincode}</div>
                    </div>
                </div>
            </div>
        `;

        // Educational Information
        displayHTML += `
            <div class="display-section">
                <h3><i class="fas fa-graduation-cap"></i> Educational Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Qualification</div>
                        <div class="info-value">${data.qualification}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Institution</div>
                        <div class="info-value">${data.institution}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Percentage/CGPA</div>
                        <div class="info-value">${data.percentage}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Course Applied</div>
                        <div class="info-value">${data.course}</div>
                    </div>
                </div>
            </div>
        `;

        // Skills
        if (data.skills && data.skills.length > 0) {
            displayHTML += `
                <div class="display-section">
                    <h3><i class="fas fa-laptop-code"></i> Programming Skills</h3>
                    <div class="skills-list">
                        ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Experience
        if (data.experience) {
            displayHTML += `
                <div class="display-section">
                    <h3><i class="fas fa-briefcase"></i> Experience</h3>
                    <div class="info-item">
                        <div class="info-value">${data.experience}</div>
                    </div>
                </div>
            `;
        }

        // Why Join
        displayHTML += `
            <div class="display-section">
                <h3><i class="fas fa-comment-dots"></i> Why Join Us?</h3>
                <div class="info-item">
                    <div class="info-value">${data.whyJoin}</div>
                </div>
            </div>
        `;

        $('#displayContent').html(displayHTML);
    }

    // Helper Functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Phone number formatting
    $('#phone, #altPhone').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Pincode formatting
    $('#pincode').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Name fields - only letters
    $('#firstName, #lastName, #city, #state').on('input', function () {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });

    // Smooth scroll to top on page load
    $('html, body').animate({ scrollTop: 0 }, 'fast');

    // Print functionality
    window.printApplication = function () {
        window.print();
    };

});
