# Mental Health Triage System

## System Description

The Mental Health Triage System is a web-based application built using the MERN (MongoDB, Express, React, Node.js) stack, designed to assist psychologists, mental health organizations, and administrators in efficiently managing patient triaging, diagnosis records, and organizational workflows.

The system provides a digital platform where psychologists can record patient symptoms, assign preliminary diagnoses, and organize their cases in a secure, centralized environment. It supports both independent psychologists who manage their own patients and organization-based psychologists working within mental health centers, hospitals, or companies.

Administrators (or organization owners) can register their centers, invite psychologists through secure registration tokens, and monitor their organization's activity, including patient counts and diagnosis trends. A Super Admin oversees all organizations, manages the global diagnosis catalog, and ensures system-wide data consistency and compliance.

## Purpose and Objectives

The main purpose of the Mental Health Triage System is to streamline and digitize the mental health assessment workflow, replacing manual recordkeeping with an integrated platform that offers structure, accessibility, and insight.

### It aims to:

- Provide psychologists with an easy-to-use interface for patient triaging and diagnosis tracking
- Help organizations maintain consistent and organized records of mental health cases
- Enable administrators to oversee staff performance and patient data through analytics dashboards
- Promote data-driven insights into common mental health disorders and patient patterns
- Improve coordination among psychologists and organizational leaders in managing mental health services

## How It Helps Psychologists

The system directly benefits psychologists by simplifying daily case management and triage documentation while giving them access to diagnostic data and personalized insights.

### Key Benefits:

#### Digital Patient Management
- Psychologists can add, edit, and manage patient profiles digitally
- Patient history and previous diagnoses are easily accessible

#### Efficient Triaging Process
- The triage interface allows psychologists to quickly input symptoms and assign short diagnoses
- Reduces paperwork and ensures standardized data entry

#### Personal Diagnosis Catalog
- Psychologists can maintain their own list of frequently used diagnoses while also accessing organization-wide and global diagnosis lists
- This flexibility ensures both personalization and consistency

#### Data Insights & Analytics
- Each psychologist has a dashboard showing key statistics such as patient count, triage sessions, and most-used diagnoses
- Helps identify recurring cases and improve decision-making

#### Collaboration and Scalability
- Psychologists can work individually or as part of an organization
- Independent practitioners can upgrade their accounts to organizational level as their practice grows

#### Centralized & Secure System
- All records are securely stored in a centralized database
- Eliminates the risk of misplaced physical files and allows for easy retrieval anytime

## Overall Impact

By combining data management, triage recording, and organizational coordination, the Mental Health Triage System enhances the efficiency and accuracy of mental health professionals. It reduces administrative workload, supports better documentation practices, and fosters a more collaborative and data-informed approach to psychological care.

Ultimately, the system contributes to improving mental health service delivery, enabling psychologists and organizations to focus more on patient care and less on manual recordkeeping.

## Technology Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **Material UI 7.3.4** - Professional UI components and theming
- **Redux Toolkit 2.9.0** - State management
- **React Router DOM 7.9.4** - Client-side routing
- **Vite 7.1.7** - Fast build tool and development server
- **Axios 1.12.2** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting
- **CSS3** - Modern styling with animations and responsive design

## Features

### Core Functionality
- **Patient Management** - Digital patient profiles and history tracking
- **Triage System** - Streamlined symptom recording and preliminary diagnosis
- **Diagnosis Catalog** - Personal, organizational, and global diagnosis libraries
- **Analytics Dashboard** - Performance metrics and insights
- **Multi-tenant Architecture** - Support for individual and organizational accounts
- **Secure Authentication** - Role-based access control
- **Seat Upgrades** - Organizations can add seats mid-cycle with prorated billing; seats activate immediately while billing dates stay unchanged.

### User Experience
- **Responsive Design** - Works seamlessly across all devices
- **Modern UI/UX** - Clean, professional interface with micro-animations
- **Accessibility** - ARIA labels, semantic HTML, and keyboard navigation
- **Dark Mode Support** - Automatic theme switching based on user preference
- **Performance Optimized** - Fast loading and smooth interactions

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd MentalHealthTriage
```

2. Install backend dependencies
```bash
cd Backend
npm install
```

3. Install frontend dependencies
```bash
cd ../Frontend
npm install
```

4. Start the development servers
```bash
# Backend (from Backend directory)
npm start

# Frontend (from Frontend directory)
npm run dev
```

### Environment Setup
Create environment files for both frontend and backend with appropriate configuration variables.

## Contributing

We welcome contributions to improve the Mental Health Triage System. Please follow our coding standards and submit pull requests for review.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact our development team or create an issue in the repository.