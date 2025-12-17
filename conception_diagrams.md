# Conception Diagrams - AI Recruitment Platform

## 1. Use Case Diagram

This diagram illustrates the main interactions between actors (Recruiter, Candidate) and the system's features.

```mermaid
usecaseDiagram
    actor "Recruiter" as R
    actor "Candidate" as C
    actor "System AI" as AI

    package "AI Recruitment Platform" {
        usecase "Upload & Analyze CV" as UC1
        usecase "View Recruiter Dashboard" as UC2
        usecase "Filter & Rank Candidates" as UC3
        usecase "Train ML Model" as UC4
        usecase "Perform Voice Interview" as UC5
        usecase "Generate Interview Summary" as UC6
    }

    R --> UC1
    R --> UC2
    R --> UC3
    R --> UC4
    C --> UC5
    
    UC1 ..> AI : Uses
    UC5 ..> AI : Uses
    UC6 ..> AI : Uses
    UC4 ..> AI : Refines
```

## 2. Class Diagram

Represents the data structure based on the Mongoose models found in `backend/models/new-features/`.

```mermaid
classDiagram
    class CVAnalysis {
        +String candidateName
        +String email
        +String[] skills
        +String[] experience
        +String education
        +Number matchScore
        +String jobDescription
        +Date createdAt
        +analyze()
    }

    class InterviewSession {
        +String candidateId
        +String jobId
        +String status
        +String summary
        +Number overallScore
        +start()
        +complete()
    }

    class InterviewExchange {
        +String sessionId
        +String question
        +String answer
        +String analysis
        +Number sentimentScore
        +Date timestamp
    }

    class TrainingData {
        +String inputType
        +Object data
        +String feedback
        +Number weight
        +train()
    }

    InterviewSession "1" -- "*" InterviewExchange : contains
    CVAnalysis "1" -- "0..1" InterviewSession : triggers
```

## 3. Sequence Diagram (Voice Interview Flow)

Details the interaction flow during an AI-driven voice interview.

```mermaid
sequenceDiagram
    participant C as Candidate
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant W as Whisper API (STT)
    participant G as GPT-4 (Analysis)

    C->>FE: Starts Interview
    FE->>BE: POST /session/start
    BE-->>FE: Session Created (Welcome Msg)
    
    loop Interview Exchange
        C->>FE: Speaks Answer
        FE->>BE: POST /transcribe (Audio)
        BE->>W: Transcribe Audio
        W-->>BE: Text Transcript
        
        BE->>G: Analyze Answer & Generate Question
        G-->>BE: Analysis + Next Question
        
        BE->>FE: Return JSON (Next Question)
        FE-->>C: Display/Speak Question
    end

    C->>FE: Ends Interview
    FE->>BE: POST /session/complete
    BE->>G: Generate Final Summary
    G-->>BE: Summary
    BE-->>FE: Interview Complete
```

## 4. Activity Diagram (Recruitment Process)

Shows the end-to-end workflow from application to final ranking.

```mermaid
stateDiagram-v2
    [*] --> UploadCV
    UploadCV --> AnalyzeCV : System parses PDF
    AnalyzeCV --> CalculateScore : Compare with Job Desc
    
    state if_score <<choice>>
    CalculateScore --> if_score
    
    if_score --> Reject : Score < Threshold
    if_score --> InviteInterview : Score >= Threshold
    
    InviteInterview --> VoiceInterview : Candidate performs
    VoiceInterview --> AIAnalysis : Real-time processing
    AIAnalysis --> GenerateSummary : Post-interview
    
    GenerateSummary --> RankCandidate : Update Dashboard
    RankCandidate --> RecruiterReview
    RecruiterReview --> [*]
```

## 5. Architecture Diagram

High-level conceptual architecture of the system components.

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        React[Next.js Frontend]
    end

    subgraph "Server Layer"
        API[Express Backend API]
        Auth[Authentication Middleware]
        Controllers[Feature Controllers]
    end

    subgraph "Data Layer"
        DB[(MongoDB Database)]
    end

    subgraph "AI Services"
        OpenAI[OpenAI GPT-4]
        Whisper[OpenAI Whisper]
    end

    Browser <--> React
    React <--> API
    API --> Auth
    Auth --> Controllers
    Controllers <--> DB
    Controllers <--> OpenAI
    Controllers <--> Whisper
```
