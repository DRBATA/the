# Hydration Agent Workflow Knowledge Base

---

## [TAG: session_management]
### Step: Start Session
**Description:** Begin a new hydration tracking session for a user on a given date.
**Preconditions:**
- No `session_start` event exists for the user on today’s date.
**Actions:**
- Instruct backend to create a `session_start` event.
- Optionally clear today’s logs and plans if user requests reset.
**Tools/Functions:**
- `reset_session` (clears logs/plans and starts new session)
- `start_session` (creates a new session_start event)
**User Input:**
- Confirmation required if session already exists (reset/continue/cancel).
**Outcome:**
- Session initialized; user can begin logging events.

---

## [TAG: logging]
### Step: Log Event(s)
**Description:** Add hydration, food, activity, or supplement events for the current session/day.
**Preconditions:**
- Session for today exists.
**Actions:**
- Collect event details (type, category, name, amount, unit, timestamp).
- Instruct backend to insert events into `hydration_event_staging`.
**Tools/Functions:**
- `log_event_batch` (batch log events to staging)
**User Input:**
- User selects items and confirms logging.
**Outcome:**
- Events are staged for validation.

---

## [TAG: validation]
### Step: Validate Events
**Description:** Validate and enrich staged events, moving them to the validated table.
**Preconditions:**
- Events exist in `hydration_event_staging` for user/date.
**Actions:**
- Instruct backend to validate staged events.
- Enrich with AI if necessary.
**Tools/Functions:**
- `validate_events` (validate and enrich staged events)
**User Input:**
- None (automatic after logging, unless errors occur).
**Outcome:**
- Validated events ready for projection and planning.

---

## [TAG: projection]
### Step: Update Trajectory/Projection
**Description:** Recalculate fluid and ion balance, losses, and projections based on validated logs.
**Preconditions:**
- Validated events exist for user/date.
**Actions:**
- Instruct backend to update trajectory/projection.
**Tools/Functions:**
- `recalculate_projection` (recalculate based on validated logs)
**User Input:**
- None (automatic after validation).
**Outcome:**
- Current status and targets updated for planning.

---

## [TAG: plan_generation]
### Step: Generate Personalized Plan
**Description:** Generate a hydration plan to help user reach their daily targets.
**Preconditions:**
- Trajectory/projection and validated logs available.
**Actions:**
- Agent (LLM) analyzes profile, validated logs, trajectory, and hydration library.
- Optionally references scenario library for guidance.
- Generates actionable plan steps.
- Instructs backend to save plan to `plan_recommendations`.
**Tools/Functions:**
- `generate_plan` (LLM call with full context)
**User Input:**
- User can review and accept/reject plan steps.
**Outcome:**
- Plan available in UI for user to follow.

---

## [TAG: plan_review]
### Step: Review/Accept/Reject Plan
**Description:** User reviews generated plan, can accept or reject individual steps.
**Preconditions:**
- Plan exists for user/date.
**Actions:**
- Present plan steps to user.
- If rejected, agent generates alternative recommendations.
- Instructs backend to update plan status/steps.
**Tools/Functions:**
- `update_plan_status`, `generate_alternative_plan`
**User Input:**
- Accept/reject each plan step.
**Outcome:**
- Plan is iteratively refined and accepted.

---

## [TAG: agentic_conversation]
### Step: Conversational Guidance
**Description:** The agent guides the user through the workflow in natural language, presenting options and explanations at each step.
**Preconditions:**
- Any step requiring user input or confirmation.
**Actions:**
- Present options and explanations in chat.
- Wait for user confirmation before proceeding.
**Tools/Functions:**
- None (LLM/agent handles conversation; backend only acts on confirmed instructions).
**User Input:**
- Free-text or button selection in chat.
**Outcome:**
- User is always in the loop, agent is always the guide.

---

## [TAG: backend_tools]
### Available Backend Functions/Tools
- `reset_session`: Clear today’s logs and plans, start new session.
- `start_session`: Create a session_start event for today.
- `log_event_batch`: Log one or more events to staging.
- `validate_events`: Validate and enrich staged events.
- `recalculate_projection`: Update fluid/ion projections.
- `generate_plan`: Call LLM to generate personalized plan.
- `update_plan_status`: Mark plan steps as accepted/rejected.
- `generate_alternative_plan`: Generate alternative plan steps if user rejects.

---

## [TAG: workflow_transitions]
### Example Workflow Transitions
- No session today → [start_session] → Logging enabled
- Events logged → [validate_events] → Events validated
- Events validated → [recalculate_projection] → Trajectory updated
- Trajectory updated → [generate_plan] → Plan generated
- Plan generated → [plan_review] → User accepts/rejects steps
- User rejects step → [generate_alternative_plan] → New step proposed

---

## [TAG: error_handling]
### Error Handling/Recovery
- If validation fails, present error and retry options to user.
- If plan generation fails, fallback to default plan or ask user for more info.
- If user cancels at any step, explain consequences and offer to resume later.

---

## [TAG: agentic_principles]
### Agentic Principles
- The agent always presents options and explanations before taking action.
- The backend only acts after explicit user or agent confirmation.
- The workflow is transparent: user can see and control each step.
- The agent adapts to user input and workflow state.
