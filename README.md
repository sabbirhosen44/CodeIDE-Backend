# CodeIDE Platform - Backend Documentation

## Table of Contents

1. [Introduction](#introduction)  
2. [Project Architecture](#project-architecture)  
3. [Install Guide](#install-guide)  
4. [Service Architecture](#service-architecture)

---

## Introduction

### Overview

The **CodeIDE Platform** is a web-based integrated development environment (IDE) that enables developers to write, run, debug, and collaborate on code directly in the browser. It removes the need for local setups and allows seamless access from any device.

### Purpose and Goals

The backend system is designed to provide the following:

- **Accessibility**: Use from anywhere, anytime.
- **Collaboration**: Real-time teamwork and coding.
- **Integration**: GitHub, cloud, and DevOps integrations.
- **Scalability**: Support from individual users to enterprise projects.
- **Security**: JWT authentication, role-based access control, and secure storage.

### Key Features

- User registration and authentication  
- Project and file management    
- Template-based project bootstrapping  
- Admin management system

### Technology Stack

- **Runtime**: Node.js  
- **Framework**: Express.js  
- **Database**: MongoDB  
- **Authentication**: JWT  
- **Language**: Typescript
---

## Project Architecture

### System Overview

The CodeIDE backend is structured around microservices that handle domain-specific responsibilities such as authentication, user management, projects, templates, and admin operations.

### Services Implemented

- **Authentication Service**  
- **Project Service**  
- **Template Service**  
- **Admin Service**

Each service is isolated for scalability and follows RESTful design principles.

---

## Install Guide

### Prerequisites

- Node.js (v16+ recommended)  
- MongoDB (Local or MongoDB Atlas)  
- npm or Yarn

### Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/codeide-backend.git
cd codeide-backend
```

2. **Install Dependencies**

Using npm:

```bash
npm install
```

Or using Yarn:

```bash
yarn
```

3. **Configure Environment Variables**

Create a `.env` file in the root directory and include:

```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRE=
CLIENT_URL=
ADMIN_EMAIL=

# Email configuration
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

4. **Run the Development Server**

Using npm:

```bash
npm run dev
```

Or using Yarn:

```bash
yarn dev
```

The backend server will run at `http://localhost:5000`

---

## Service Architecture

### Authentication Service

Handles all user authentication workflows.

**Responsibilities**:
- User signup, login
- Token generation and validation
- Email verification

**Technologies**:
- JWT
- Bcrypt
- Nodemailer

---

### Project Service

Controls project lifecycle and access management.

**Responsibilities**:
- Project CRUD operations
- Project metadata

---

### Template Service

Provides bootstrapping options via code templates.

**Responsibilities**:
- Fetch template metadata
- Retrieve template files
- Create template for language
- Organize templates by language/framework

---

### Admin Service

Handles privileged operations available only to admins.

**Responsibilities**:
- View/manage users
- Manage templates
- Monitor activity

---

> More services like FileService, ContainerService, BillingService, NotificationService, etc., will be documented upon implementation.

---

## License

This project is licensed under the MIT License.

---

## Maintainer

Developed by **Md. Sabbir Hosen**.

