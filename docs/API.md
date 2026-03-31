# API Documentation

## Authentication
- **Endpoint:** `/api/auth/login`
- **Method:** POST
- **Request Body:** 
    ```json
    {
        "username": "string",
        "password": "string"
    }
    ```
- **Response:**
    - **200 OK**: Returns user details and token.
    - **401 Unauthorized**: Invalid credentials.

## Clubs
- **Endpoint:** `/api/clubs`
- **Method:** GET
- **Response:**
    - **200 OK**: List of clubs.
    - **404 Not Found**: No clubs available.

## Events
- **Endpoint:** `/api/events`
- **Method:** GET
- **Response:**
    - **200 OK**: List of events.
    - **404 Not Found**: No events available.

## Members
- **Endpoint:** `/api/members`
- **Method:** GET
- **Response:**
    - **200 OK**: List of members.
    - **404 Not Found**: No members available.

## Join Requests
- **Endpoint:** `/api/join-requests`
- **Method:** POST
- **Request Body:** 
    ```json
    {
        "clubId": "string",
        "userId": "string"
    }
    ```
- **Response:**
    - **201 Created**: Request submitted successfully.
    - **400 Bad Request**: Invalid request.
