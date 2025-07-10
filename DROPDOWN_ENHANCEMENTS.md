# Streak CRM Node Dropdown Enhancement Checklist

## 🎯 Overview
Replace manual string inputs with dynamic dropdowns populated from Streak API to improve user experience.

## 📋 Implementation Phases

### Phase 1: Team Dropdown (High Priority) ✅ COMPLETED
- [x] Add `getTeamOptions()` loadOptions method to `Streak.node.ts`
- [x] Add `getTeams()` method to `StreakApiService.ts`
- [x] Add `IStreakTeam` interface to `StreakApiService.ts`
- [x] Update team key fields in the following locations:
  - [x] `Streak.node.ts:320` - getTeam operation teamKey
  - [x] `Streak.node.ts:1217` - createContact teamKey
  - [x] `Streak.node.ts:1450` - createOrganization teamKey
  - [x] `Streak.node.ts:1469` - checkExistingOrganizations teamKey
- [x] Verify build passes without TypeScript errors
- [x] Fix v2 API response structure handling (nested results array)
- [x] Test team dropdown functionality ✅ FIXED

### Phase 2: Stage Dropdown (Pipeline-dependent)
- [ ] Add `getStageOptions()` loadOptions method to `Streak.node.ts`
- [ ] Implement pipeline dependency logic for stage loading
- [ ] Update stage key fields in the following locations:
  - [ ] `boxOperations.ts:18` - listBoxes stageKeyFilter
  - [ ] `boxOperations.ts:85` - createBox stageKey
  - [ ] `boxOperations.ts:143` - updateBox stageKey
  - [ ] `stageOperations.ts:31` - getStage stageKey
  - [ ] `stageOperations.ts:69` - updateStage stageKey
  - [ ] `stageOperations.ts:103` - deleteStage stageKey
  - [ ] `Streak.node.ts:528` - listBoxes stageKeyFilter
  - [ ] `Streak.node.ts:559` - createBox stageKey
  - [ ] `Streak.node.ts:632` - updateBox stageKey
  - [ ] `Streak.node.ts:718` - stage operations stageKey
- [ ] Test stage dropdown functionality with pipeline dependency

### Phase 3: Box Dropdown (Pipeline-dependent)
- [ ] Add `getBoxOptions()` loadOptions method to `Streak.node.ts`
- [ ] Implement pipeline dependency logic for box loading
- [ ] Update box key fields in the following locations:
  - [ ] `boxOperations.ts:53` - getBox boxKey
  - [ ] `boxOperations.ts:120` - updateBox boxKey
  - [ ] `boxOperations.ts:153` - deleteBox boxKey
  - [ ] `boxOperations.ts:160` - getTimeline boxKey
  - [ ] `fieldOperations.ts:92` - listFieldValues boxKey
  - [ ] `fieldOperations.ts:100` - getFieldValue boxKey
  - [ ] `fieldOperations.ts:109` - updateFieldValue boxKey
  - [ ] `taskOperations.ts:30` - getTasksInBox boxKey
  - [ ] `taskOperations.ts:65` - createTask boxKey
  - [ ] `Streak.node.ts:453` - box operations boxKey
  - [ ] `Streak.node.ts:895` - field value operations boxKey
  - [ ] `Streak.node.ts:1625` - task operations boxKey
- [ ] Test box dropdown functionality with pipeline dependency

### Phase 4: User Dropdown (Medium Priority)
- [ ] Research available user listing API endpoints
- [ ] Add `getUserOptions()` loadOptions method to `Streak.node.ts`
- [ ] Update user key fields in the following locations:
  - [ ] `userOperations.ts:26` - getUser userKey
  - [ ] `boxOperations.ts:107` - createBox assignedToTeamKeyOrUserKey
  - [ ] `boxOperations.ts:147` - updateBox assignedToTeamKeyOrUserKey
  - [ ] `taskOperations.ts:79` - createTask assignees
  - [ ] `taskOperations.ts:124` - updateTask assignees
  - [ ] `Streak.node.ts:281` - getUser userKey
  - [ ] `Streak.node.ts:594` - createBox assignedToTeamKeyOrUserKey
  - [ ] `Streak.node.ts:639` - updateBox assignedToTeamKeyOrUserKey
  - [ ] `Streak.node.ts:1679` - createTask assignees
  - [ ] `Streak.node.ts:1734` - updateTask assignees
- [ ] Test user dropdown functionality

### Phase 5: Field Dropdown (Pipeline-dependent)
- [ ] Add `getFieldOptions()` loadOptions method to `Streak.node.ts`
- [ ] Implement pipeline dependency logic for field loading
- [ ] Update field key fields in the following locations:
  - [ ] `fieldOperations.ts:27` - getField fieldKey
  - [ ] `fieldOperations.ts:65` - updateField fieldKey
  - [ ] `fieldOperations.ts:83` - deleteField fieldKey
  - [ ] `fieldOperations.ts:101` - getFieldValue fieldKey
  - [ ] `fieldOperations.ts:111` - updateFieldValue fieldKey
  - [ ] `Streak.node.ts:915` - field operations fieldKey
- [ ] Test field dropdown functionality with pipeline dependency

## 🛠️ Technical Implementation Details

### Required Changes to `Streak.node.ts`

#### Add to `methods.loadOptions` (around line 32):
```typescript
// Add team dropdown
async getTeamOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  // Implementation needed
}

// Add stage dropdown (pipeline-dependent)
async getStageOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  // Implementation needed
}

// Add box dropdown (pipeline-dependent)
async getBoxOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  // Implementation needed
}

// Add user dropdown
async getUserOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  // Implementation needed
}

// Add field dropdown (pipeline-dependent)
async getFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  // Implementation needed
}
```

#### Field Type Changes:
Change from:
```typescript
{
  displayName: 'Team Key',
  name: 'teamKey',
  type: 'string',
  // ...
}
```

To:
```typescript
{
  displayName: 'Team',
  name: 'teamKey',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getTeamOptions',
  },
  // ...
}
```

## 🧪 Testing Checklist
- [ ] Test all dropdowns load properly
- [ ] Test dropdown filtering/search functionality
- [ ] Test dependent dropdowns (stage/box/field based on pipeline)
- [ ] Test error handling when API calls fail
- [ ] Test with different user permissions
- [ ] Verify backward compatibility with existing configurations

## 📊 Success Metrics
- [ ] Reduced user errors from incorrect key entry
- [ ] Improved user experience feedback
- [ ] Faster workflow setup time
- [ ] Reduced support requests for finding keys

---
**API Endpoints Available:**
- ✅ `GET /users/me/teams` - Teams
- ✅ `GET /pipelines/{pipelineKey}/stages` - Stages  
- ✅ `GET /pipelines/{pipelineKey}/boxes` - Boxes
- ✅ `GET /pipelines/{pipelineKey}/fields` - Fields
- ❓ User listing endpoint (needs research)