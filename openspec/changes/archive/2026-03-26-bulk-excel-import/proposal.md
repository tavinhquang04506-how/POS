## Why

Currently, staff must manually select, input quantities, and enter prices for every single product when creating a Purchase Order (PO). For wholesale or large-scale inventory receiving, typing hundreds of products manually is extremely time-consuming and error-prone. We need a way to upload an Excel file and automatically parse/insert the invoice details.

## What Changes

- Add an `Import từ Excel` button to the `ReceiveTab.tsx` UI.
- Provide a standardized Excel `.xlsx` template for users to download and fill in.
- Parse the uploaded Excel file on the frontend to display a preview table of the parsed products.
- Create a new backend endpoint `POST /api/inventory/import-excel` to process the bulk data.
- The backend will use a single Prisma `$transaction` to validate barcodes, create the `PhieuNhap` record, insert multiple `ChiTietPhieuNhap` entries, and update `SoLuongTon` for the imported products simultaneously.

## Capabilities

### New Capabilities
- `bulk-excel-import`: Defines the Excel template structure and the frontend UI logic for file reading via standard `xlsx` utilities.

### Modified Capabilities
- `inventory-api`: Add `POST /api/inventory/import-excel` bulk processing hook to handle massive JSON arrays from the client.
- `inventory`: Update the `ReceiveTab` UI interface to mount the new import button alongside the manual form.

## Impact

- **Frontend**: The `ReceiveTab.tsx` will be restructured to toggle between "Manual Entry" and "Excel Import" modes. The `xlsx` package must be installed or utilized if already present.
- **Backend**: The `inventory.controller.ts` will receive the new bulk endpoint. The Prisma transaction model must be robust enough to handle potential rollback if a single barcode in the 100-row file is invalid or missing.
