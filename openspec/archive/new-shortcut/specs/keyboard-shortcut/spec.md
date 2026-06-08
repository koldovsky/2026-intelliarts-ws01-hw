# Spec: Keyboard Shortcut for "Unlock All Elements"

## Requirement
Pressing `CtrlOrCmd+Shift+U` when there are locked elements on the canvas (and no elements are selected) should unlock all elements.

## Success Criteria
1. With locked elements on canvas and NO selection:
   - Press `CtrlOrCmd+Shift+U`
   - All elements become unlocked.
   - All previously locked elements become selected.
2. The shortcut should be visible in the shortcuts dialog (if applicable).
