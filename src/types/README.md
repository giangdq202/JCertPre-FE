# Frontend Validation Systems

This document describes the validation systems implemented in the frontend to mirror backend validation requirements.

## 🔧 **Shared Validation Utilities**

### **Overview**

The Shared Validation Utilities provide centralized, consistent validation functions used across all validation systems. This ensures consistency and makes maintenance easier.

### **Key Utilities**

- **`isValidGuid()`**: Validates GUID format and ensures it's not default/empty (matches backend `NotDefaultGuidAttribute`)
- **`ValidationResult`**: Common interface for validation results
- **`ValidationFunction<T>`**: Common type for validation functions

### **Backend Synchronization**

The `isValidGuid()` function exactly matches the backend's `NotDefaultGuidAttribute` behavior:

- Validates proper GUID format using regex
- Ensures GUID is not the default/empty GUID (`00000000-0000-0000-0000-000000000000`)
- Used consistently across all DTOs that require `NotDefaultGuid` validation

### **Usage Example**

```typescript
import { isValidGuid } from "../types/validationUtils";

const userId = "123e4567-e89b-12d3-a456-426614174000";
if (isValidGuid(userId)) {
  // GUID is valid and not default
  console.log("Valid GUID");
} else {
  // GUID is invalid or default
  console.log("Invalid or default GUID");
}
```

---

## 🎯 **Choice Validation System**

### **Overview**

The Choice Validation System provides comprehensive validation for choice creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`ChoiceCreateDto`**: For creating new choices
- **`ChoiceUpdateDto`**: For updating existing choices
- **`ChoiceReadDto`**: For reading choice data

### **Validation Rules**

- **Content**: Required, MinLength(1), MaxLength(500)
- **IsCorrect**: Required boolean value

### **Constants**

- `CHOICE_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `validateChoiceContent()`: Validates individual choice content
- `validateChoiceCreateDto()`: Validates creation DTOs
- `validateChoiceUpdateDto()`: Validates update DTOs

### **Integration Points**

- `CreateTestModal.tsx`: Choice creation with validation
- `EditTestModal.tsx`: Choice editing with validation
- `CreateQuestionPage.tsx`: Question creation with choice validation
- `questionService.ts`: Service layer integration

### **Usage Example**

```typescript
import {
  validateChoiceCreateDto,
  CHOICE_VALIDATION_RULES,
} from "../types/choice.types";

const choice = { content: "Sample choice", isCorrect: true };
const validation = validateChoiceCreateDto(choice);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 📚 **Lesson Validation System**

### **Overview**

The Lesson Validation System provides comprehensive validation for lesson creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateLessonDto`**: For creating new lessons
- **`UpdateLessonDto`**: For updating existing lessons
- **`LessonDto`**: For reading lesson data

### **Validation Rules**

- **Title**: Required, MinLength(1), MaxLength(200)
- **LessonOrder**: Required, Range(1, 10000)
- **Content**: Required, MinLength(1), MaxLength(5000)

### **Constants**

- `LESSON_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `validateLessonTitle()`: Validates lesson title
- `validateLessonOrder()`: Validates lesson order
- `validateLessonContent()`: Validates lesson content
- `validateLessonCreateDto()`: Validates creation DTOs
- `validateLessonUpdateDto()`: Validates update DTOs

### **Integration Points**

- `CourseDetailPage.tsx`: Lesson creation and editing with validation
- `lessonService.ts`: Service layer integration

### **Usage Example**

```typescript
import {
  validateLessonCreateDto,
  LESSON_VALIDATION_RULES,
} from "../types/lesson.types";

const lesson = {
  title: "Sample Lesson",
  lessonOrder: 1,
  content: "Lesson content",
};
const validation = validateLessonCreateDto(lesson);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 📊 **Lesson Progress Validation System**

### **Overview**

The Lesson Progress Validation System provides comprehensive validation for lesson progress creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateLessonProgressDto`**: For creating new lesson progress (matches backend)
- **`UpdateLessonProgressDto`**: For updating existing lesson progress
- **`LessonProgressDto`**: For reading lesson progress data
- **`CreateLessonProgressWithCourseDto`**: Legacy interface for backward compatibility

### **Validation Rules**

- **UserId**: Required, NotDefaultGuid (valid GUID format)
- **LessonId**: Required, NotDefaultGuid (valid GUID format)
- **CompletionRate**: Required, Range(0, 100) for updates

### **Constants**

- `LESSON_PROGRESS_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `isValidGuid()`: Validates GUID format
- `validateLessonProgressCreateDto()`: Validates creation DTOs
- `validateLessonProgressUpdateDto()`: Validates update DTOs

### **Integration Points**

- `lessonProgressService.ts`: Service layer with validation
- `useLessonProgress.ts`: Custom hook with validation
- `LessonProgressTracker.tsx`: UI component integration

### **Usage Example**

```typescript
import {
  validateLessonProgressCreateDto,
  LESSON_PROGRESS_VALIDATION_RULES,
} from "../types/lessonProgress.types";

const progress = { userId: "user-guid", lessonId: "lesson-guid" };
const validation = validateLessonProgressCreateDto(progress);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## ❓ **Question Validation System**

### **Overview**

The Question Validation System provides comprehensive validation for question creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateQuestionDto`**: For creating new questions
- **`UpdateQuestionDto`**: For updating existing questions
- **`QuestionDto`**: For reading question data

### **Validation Rules**

- **Content**: Required, MinLength(10), MaxLength(1000)
- **Explanation**: Optional, MaxLength(1000)
- **Points**: Required, Range(1, 100)
- **Difficulty**: Required
- **IsActive**: Required
- **ContentName**: Required
- **Level**: Required
- **SubContentName**: Required
- **AudioFile**: Optional

### **Constants**

- `QUESTION_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `validateQuestionContent()`: Validates question content
- `validateQuestionExplanation()`: Validates question explanation
- `validateQuestionPoints()`: Validates question points
- `validateQuestionCreateDto()`: Validates creation DTOs
- `validateQuestionUpdateDto()`: Validates update DTOs

### **Integration Points**

- `questionService.ts`: Service layer with validation
- `CreateQuestionPage.tsx`: Question creation with validation
- `CreateTestModal.tsx`: Test creation with question validation

### **Usage Example**

```typescript
import {
  validateQuestionCreateDto,
  QUESTION_VALIDATION_RULES,
} from "../types/question.types";

const question = {
  content: "Sample question content",
  points: 10,
  difficulty: QuestionDifficulty.MEDIUM,
  isActive: true,
  contentName: ContentName.GRAMMAR,
  level: CourseLevel.N5,
  subContentName: SubContentName.BASIC_GRAMMAR,
};
const validation = validateQuestionCreateDto(question);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 🔧 **SubContent Validation System**

### **Overview**

The SubContent Validation System provides comprehensive validation for sub-content creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateSubContentDto`**: For creating new sub-content
- **`UpdateSubContentDto`**: For updating existing sub-content
- **`SubContentDto`**: For reading sub-content data

### **Validation Rules**

- **SubContentName**: Required
- **Level**: Required
- **ContentName**: Required

### **Constants**

- `SUB_CONTENT_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `validateSubContentCreateDto()`: Validates creation DTOs
- `validateSubContentUpdateDto()`: Validates update DTOs

### **Integration Points**

- `subContentService.ts`: Service layer with validation
- `CreateTestModal.tsx`: Test creation with sub-content validation
- `CreateQuestionPage.tsx`: Question creation with sub-content validation

### **Usage Example**

```typescript
import {
  validateSubContentCreateDto,
  SUB_CONTENT_VALIDATION_RULES,
} from "../services/subContentService";

const subContent = {
  subContentName: SubContentName.BASIC_GRAMMAR,
  level: CourseLevel.N5,
  contentName: ContentName.GRAMMAR,
};
const validation = validateSubContentCreateDto(subContent);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 🧪 **Test Validation System**

### **Overview**

The Test Validation System provides comprehensive validation for test creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateTestDto`**: For creating new tests
- **`UpdateTestDto`**: For updating existing tests
- **`TestDto`**: For reading test data
- **`CreateAutoTestInput`**: For creating auto tests

### **Validation Rules**

- **Title**: Required, MinLength(3), MaxLength(200)
- **Description**: Optional, MaxLength(1000)
- **TestType**: Required
- **CourseLevel**: Required
- **DurationMinutes**: Required, Range(1, 1000)
- **MaxAttempts**: Required, Range(1, 100)
- **PassingPercentage**: Required, Range(0, 100)
- **AvailableFrom**: Optional
- **AvailableTo**: Optional

### **Constants**

- `TEST_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `validateTestTitle()`: Validates test title
- `validateTestDescription()`: Validates test description
- `validateTestDurationMinutes()`: Validates test duration
- `validateTestMaxAttempts()`: Validates test max attempts
- `validateTestPassingPercentage()`: Validates test passing percentage
- `validateTestCreateDto()`: Validates creation DTOs
- `validateTestUpdateDto()`: Validates update DTOs
- `validateCreateAutoTestInput()`: Validates auto test input

### **Integration Points**

- `testService.ts`: Service layer with validation
- `CreateTestModal.tsx`: Test creation with validation
- `EditTestModal.tsx`: Test editing with validation
- `CourseDetailPage.tsx`: Course management with test validation

### **Usage Example**

```typescript
import {
  validateTestCreateDto,
  TEST_VALIDATION_RULES,
} from "../types/test.types";

const test = {
  title: "Sample Test",
  description: "Test description",
  testType: TestType.CUSTOM_MANUAL,
  courseLevel: CourseLevel.N5,
  durationMinutes: 60,
  maxAttempts: 3,
  passingPercentage: 70,
};
const validation = validateTestCreateDto(test);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 🎯 **Test Attempt Validation System**

### **Overview**

The Test Attempt Validation System provides comprehensive validation for test attempt operations, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`StartTestAttemptDto`**: For starting new test attempts
- **`SubmitTestAttemptDto`**: For submitting completed test attempts
- **`TestAttemptDto`**: For reading test attempt data

### **Validation Rules**

- **TestId**: Required, NotDefaultGuid (valid GUID format)
- **UserId**: Required, NotDefaultGuid (valid GUID format)
- **AttemptId**: Required, NotDefaultGuid (valid GUID format)

### **Constants**

- `TEST_ATTEMPT_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `isValidGuid()`: Validates GUID format
- `validateStartTestAttemptDto()`: Validates start attempt DTOs
- `validateSubmitTestAttemptDto()`: Validates submit attempt DTOs

### **Integration Points**

- `testAttemptService.ts`: Service layer with validation
- `TestInterface.tsx`: Test interface with attempt validation
- `JLPTTestInterface.tsx`: JLPT test interface with attempt validation
- `StudentLearnCoursePage.tsx`: Student course learning with attempt validation

### **Usage Example**

```typescript
import {
  validateStartTestAttemptDto,
  TEST_ATTEMPT_VALIDATION_RULES,
} from "../services/testAttemptService";

const startAttempt = {
  testId: "test-guid",
  userId: "user-guid",
};
const validation = validateStartTestAttemptDto(startAttempt);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 🔗 **Test Question Validation System**

### **Overview**

The Test Question Validation System provides comprehensive validation for test question operations, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`AddTestQuestionManualDto`**: For adding questions to tests manually
- **`TestQuestionDto`**: For reading test question data

### **Validation Rules**

- **TestId**: Required, NotDefaultGuid (valid GUID format)
- **QuestionId**: Required, NotDefaultGuid (valid GUID format)

### **Constants**

- `TEST_QUESTION_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `isValidGuid()`: Validates GUID format
- `validateAddTestQuestionManualDto()`: Validates add question DTOs

### **Integration Points**

- `testQuestionService.ts`: Service layer with validation
- `CreateTestModal.tsx`: Test creation with question validation
- `EditTestModal.tsx`: Test editing with question validation
- `TestInterface.tsx`: Test interface with question validation

### **Usage Example**

```typescript
import {
  validateAddTestQuestionManualDto,
  TEST_QUESTION_VALIDATION_RULES,
} from "../services/testQuestionService";

const addQuestion = {
  testId: "test-guid",
  questionId: "question-guid",
};
const validation = validateAddTestQuestionManualDto(addQuestion);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 📋 **Test Template Validation System**

### **Overview**

The Test Template Validation System provides comprehensive validation for test template creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateTestTemplateDto`**: For creating new test templates
- **`UpdateTestTemplateDto`**: For updating existing test templates
- **`TestTemplateDto`**: For reading test template data

### **Validation Rules**

- **TestTemplateTypeId**: Required, NotDefaultGuid (valid GUID format)
- **TemplateName**: Required, MinLength(3), MaxLength(200)
- **DurationMinutes**: Required, Range(1, 1000)
- **TotalScore**: Required, Range(1, 10000)
- **ToPassPercentage**: Required, Range(0, 100)
- **Sequence**: Required, Range(1, 1000)

### **Constants**

- `TEST_TEMPLATE_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `isValidGuid()`: Validates GUID format
- `validateTemplateName()`: Validates template name
- `validateDurationMinutes()`: Validates duration minutes
- `validateTotalScore()`: Validates total score
- `validateToPassPercentage()`: Validates to pass percentage
- `validateSequence()`: Validates sequence
- `validateCreateTestTemplateDto()`: Validates creation DTOs
- `validateUpdateTestTemplateDto()`: Validates update DTOs

### **Integration Points**

- `testTemplateService.ts`: Service layer with validation
- `TestTemplateTypeManagementPage.tsx`: Template management with validation
- `CreateTestModal.tsx`: Test creation with template validation

### **Usage Example**

```typescript
import {
  validateCreateTestTemplateDto,
  TEST_TEMPLATE_VALIDATION_RULES,
} from "../types/testTemplate.types";

const template = {
  testTemplateTypeId: "template-type-guid",
  templateName: "Sample Template",
  durationMinutes: 60,
  totalScore: 100,
  toPassPercentage: 70,
  sequence: 1,
};
const validation = validateCreateTestTemplateDto(template);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## ⚙️ **Test Template Config Validation System**

### **Overview**

The Test Template Config Validation System provides comprehensive validation for test template configuration creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateTestTemplateConfigDto`**: For creating new test template configs
- **`UpdateTestTemplateConfigDto`**: For updating existing test template configs
- **`TestTemplateConfigDto`**: For reading test template config data

### **Validation Rules**

- **SubContentId**: Required, NotDefaultGuid (valid GUID format)
- **QuestionCount**: Required, Range(1, 1000)
- **PointPerQuestion**: Required, Range(1, 100)
- **TotalPoints**: Required, Range(1, 10000)
- **Sequence**: Required, Range(1, 1000)

### **Constants**

- `TEST_TEMPLATE_CONFIG_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `isValidGuid()`: Validates GUID format
- `validateQuestionCount()`: Validates question count
- `validatePointPerQuestion()`: Validates point per question
- `validateTotalPoints()`: Validates total points
- `validateSequence()`: Validates sequence
- `validateCreateTestTemplateConfigDto()`: Validates creation DTOs
- `validateUpdateTestTemplateConfigDto()`: Validates update DTOs

### **Integration Points**

- `testTemplateConfigService.ts`: Service layer with validation
- `TestTemplateTypeManagementPage.tsx`: Template config management with validation
- `CreateTestModal.tsx`: Test creation with template config validation

### **Usage Example**

```typescript
import {
  validateCreateTestTemplateConfigDto,
  TEST_TEMPLATE_CONFIG_VALIDATION_RULES,
} from "../types/testTemplateConfig.types";

const config = {
  subContentId: "sub-content-guid",
  questionCount: 10,
  pointPerQuestion: 5,
  totalPoints: 50,
  sequence: 1,
};
const validation = validateCreateTestTemplateConfigDto(config);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 🏷️ **Test Template Type Validation System**

### **Overview**

The Test Template Type Validation System provides comprehensive validation for test template type creation and updates, ensuring data integrity and user experience consistency across the application.

### **DTOs**

- **`CreateTestTemplateTypeDto`**: For creating new test template types
- **`UpdateTestTemplateTypeDto`**: For updating existing test template types
- **`TestTemplateTypeDto`**: For reading test template type data

### **Validation Rules**

- **UserId**: Required, NotDefaultGuid (valid GUID format)
- **TypeName**: Required, MinLength(3), MaxLength(200)
- **CourseLevel**: Required
- **TestType**: Required
- **Description**: Required, MaxLength(1000)
- **TotalTestScore**: Required, Range(1, 1000)
- **TotalPassPercentage**: Required, Range(0, 100)

### **Constants**

- `TEST_TEMPLATE_TYPE_VALIDATION_RULES`: Centralized validation messages and limits

### **Validation Functions**

- `isValidGuid()`: Validates GUID format
- `validateTypeName()`: Validates type name
- `validateDescription()`: Validates description
- `validateTotalTestScore()`: Validates total test score
- `validateTotalPassPercentage()`: Validates total pass percentage
- `validateCreateTestTemplateTypeDto()`: Validates creation DTOs
- `validateUpdateTestTemplateTypeDto()`: Validates update DTOs

### **Integration Points**

- `testTemplateTypeService.ts`: Service layer with validation
- `TestTemplateTypeManagementPage.tsx`: Template type management with validation
- `CreateTestModal.tsx`: Test creation with template type validation

### **Usage Example**

```typescript
import {
  validateCreateTestTemplateTypeDto,
  TEST_TEMPLATE_TYPE_VALIDATION_RULES,
} from "../types/testTemplateType.types";

const templateType = {
  userId: "user-guid",
  typeName: "JLPT N5 Practice Test",
  courseLevel: CourseLevel.N5,
  testType: TestType.JLPTAuto,
  description: "Automated JLPT N5 practice test",
  totalTestScore: 100,
  totalPassPercentage: 70,
};
const validation = validateCreateTestTemplateTypeDto(templateType);

if (!validation.isValid) {
  console.error(validation.message);
}
```

---

## 🔧 **Key Features**

### **Centralized Validation Utilities**

- Shared `isValidGuid()` function matching backend `NotDefaultGuidAttribute`
- Consistent validation result interfaces across all systems
- Centralized maintenance and updates

### **Real-time Validation**

- Form validation on blur events
- Character count displays
- Immediate error feedback

### **Backend Synchronization**

- DTOs match backend validation attributes exactly
- Validation rules mirror backend requirements
- Consistent error messages
- `NotDefaultGuid` validation matches backend behavior precisely

### **Type Safety**

- Full TypeScript support
- Interface definitions for all DTOs
- Compile-time validation

### **Reusable Components**

- `ChoiceInput`: Individual choice input with validation
- `ChoiceList`: Multiple choice management
- `ChoiceValidationHelper`: Validation utility functions

### **Backward Compatibility**

- Legacy interfaces maintained where needed
- Gradual migration path for existing code
- Service layer abstraction for smooth transitions
