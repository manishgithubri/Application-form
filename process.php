<?php
header('Content-Type: application/json');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Initialize response array
$response = array(
    'success' => false,
    'message' => '',
    'data' => array()
);

try {
    // Check if form is submitted
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        
        // Sanitize and validate input data
        $data = array();
        
        // Personal Information
        $data['firstName'] = sanitizeInput($_POST['firstName'] ?? '');
        $data['lastName'] = sanitizeInput($_POST['lastName'] ?? '');
        $data['dob'] = sanitizeInput($_POST['dob'] ?? '');
        $data['gender'] = sanitizeInput($_POST['gender'] ?? '');
        
        // Contact Information
        $data['email'] = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $data['phone'] = sanitizeInput($_POST['phone'] ?? '');
        $data['altPhone'] = sanitizeInput($_POST['altPhone'] ?? '');
        $data['address'] = sanitizeInput($_POST['address'] ?? '');
        $data['city'] = sanitizeInput($_POST['city'] ?? '');
        $data['state'] = sanitizeInput($_POST['state'] ?? '');
        $data['pincode'] = sanitizeInput($_POST['pincode'] ?? '');
        
        // Educational Information
        $data['qualification'] = sanitizeInput($_POST['qualification'] ?? '');
        $data['institution'] = sanitizeInput($_POST['institution'] ?? '');
        $data['percentage'] = sanitizeInput($_POST['percentage'] ?? '');
        $data['course'] = sanitizeInput($_POST['course'] ?? '');
        
        // Skills & Interests
        $data['skills'] = isset($_POST['skills']) ? $_POST['skills'] : array();
        $data['experience'] = sanitizeInput($_POST['experience'] ?? '');
        $data['whyJoin'] = sanitizeInput($_POST['whyJoin'] ?? '');
        
        // Server-side Validation
        $errors = array();
        
        // Validate required fields
        if (empty($data['firstName'])) {
            $errors[] = 'First name is required';
        }
        
        if (empty($data['lastName'])) {
            $errors[] = 'Last name is required';
        }
        
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Valid email is required';
        }
        
        if (empty($data['phone']) || !preg_match('/^[0-9]{10}$/', $data['phone'])) {
            $errors[] = 'Valid 10-digit phone number is required';
        }
        
        if (empty($data['dob'])) {
            $errors[] = 'Date of birth is required';
        }
        
        if (empty($data['gender'])) {
            $errors[] = 'Gender is required';
        }
        
        if (empty($data['address'])) {
            $errors[] = 'Address is required';
        }
        
        if (empty($data['city'])) {
            $errors[] = 'City is required';
        }
        
        if (empty($data['state'])) {
            $errors[] = 'State is required';
        }
        
        if (empty($data['pincode']) || !preg_match('/^[0-9]{6}$/', $data['pincode'])) {
            $errors[] = 'Valid 6-digit pincode is required';
        }
        
        if (empty($data['qualification'])) {
            $errors[] = 'Qualification is required';
        }
        
        if (empty($data['institution'])) {
            $errors[] = 'Institution name is required';
        }
        
        if (empty($data['percentage'])) {
            $errors[] = 'Percentage/CGPA is required';
        }
        
        if (empty($data['course'])) {
            $errors[] = 'Course selection is required';
        }
        
        if (empty($data['whyJoin'])) {
            $errors[] = 'Please tell us why you want to join';
        }
        
        // If there are validation errors
        if (!empty($errors)) {
            $response['message'] = implode(', ', $errors);
            echo json_encode($response);
            exit;
        }
        
        // Generate unique application ID
        $applicationId = 'APP' . time() . rand(1000, 9999);
        $data['applicationId'] = $applicationId;
        $data['submittedDate'] = date('Y-m-d H:i:s');
        
        // Save to file (optional - you can save to database instead)
        $filename = 'applications/application_' . $applicationId . '.json';
        
        // Create directory if it doesn't exist
        if (!file_exists('applications')) {
            mkdir('applications', 0777, true);
        }
        
        // Save data to file
        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
        
        // Optional: Save to database
        // saveToDatabase($data);
        
        // Success response
        $response['success'] = true;
        $response['message'] = 'Application submitted successfully!';
        $response['data'] = $data;
        
        // Optional: Send email notification
        // sendEmailNotification($data);
        
    } else {
        $response['message'] = 'Invalid request method';
    }
    
} catch (Exception $e) {
    $response['message'] = 'An error occurred: ' . $e->getMessage();
}

// Return JSON response
echo json_encode($response);

// Helper function to sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Optional: Function to save to database
function saveToDatabase($data) {
    // Database configuration
    $host = 'localhost';
    $dbname = 'registration_db';
    $username = 'root';
    $password = '';
    
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sql = "INSERT INTO applications (
            application_id, first_name, last_name, dob, gender, email, 
            phone, alt_phone, address, city, state, pincode, 
            qualification, institution, percentage, course, 
            skills, experience, why_join, submitted_date
        ) VALUES (
            :application_id, :first_name, :last_name, :dob, :gender, :email,
            :phone, :alt_phone, :address, :city, :state, :pincode,
            :qualification, :institution, :percentage, :course,
            :skills, :experience, :why_join, :submitted_date
        )";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':application_id' => $data['applicationId'],
            ':first_name' => $data['firstName'],
            ':last_name' => $data['lastName'],
            ':dob' => $data['dob'],
            ':gender' => $data['gender'],
            ':email' => $data['email'],
            ':phone' => $data['phone'],
            ':alt_phone' => $data['altPhone'],
            ':address' => $data['address'],
            ':city' => $data['city'],
            ':state' => $data['state'],
            ':pincode' => $data['pincode'],
            ':qualification' => $data['qualification'],
            ':institution' => $data['institution'],
            ':percentage' => $data['percentage'],
            ':course' => $data['course'],
            ':skills' => json_encode($data['skills']),
            ':experience' => $data['experience'],
            ':why_join' => $data['whyJoin'],
            ':submitted_date' => $data['submittedDate']
        ]);
        
        return true;
    } catch(PDOException $e) {
        error_log("Database Error: " . $e->getMessage());
        return false;
    }
}

// Optional: Function to send email notification
function sendEmailNotification($data) {
    $to = $data['email'];
    $subject = 'Application Received - ' . $data['applicationId'];
    $message = "Dear " . $data['firstName'] . " " . $data['lastName'] . ",\n\n";
    $message .= "Thank you for submitting your application.\n";
    $message .= "Your Application ID is: " . $data['applicationId'] . "\n\n";
    $message .= "We will review your application and get back to you soon.\n\n";
    $message .= "Best regards,\nAdmissions Team";
    
    $headers = "From: noreply@yourwebsite.com\r\n";
    $headers .= "Reply-To: admissions@yourwebsite.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($to, $subject, $message, $headers);
}
?>
