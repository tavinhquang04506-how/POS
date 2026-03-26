## ADDED Requirements

### Requirement: Fast Keyboard-driven Checkout
The system SHALL allow cashiers to perform all checkout operations using only a keyboard to maximize efficiency.

#### Scenario: Barcode scanning
- **WHEN** the cashier scans a product barcode or types it and presses Enter
- **THEN** the system adds the product to the cart and recalculates the total price and tax instantly.

#### Scenario: Payment processing
- **WHEN** the cashier presses Enter to finalize the transaction
- **THEN** the system prompts for the amount received, calculates change, and saves the invoice.

#### Scenario: Voiding items
- **WHEN** the cashier selects an item and presses the designated Delete/Void key
- **THEN** the system removes the item from the cart, updates the total, and logs the void action.
