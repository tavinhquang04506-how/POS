## Context

Store administrators currently face a significant bottleneck when processing large inbound shipments. Because the POS only supports single-item manual PO entry, a shipment of 100 products requires 100 manual barcode scans/inputs. This is highly inefficient. We are introducing a bulk Excel upload mechanism to parse standardized PO sheets on the client and push the data in a single burst loop to the server.

## Goals / Non-Goals

**Goals:**
- Provide a standardized Excel (`.xlsx`) template for purchase orders.
- Parse Excel files on the frontend using `xlsx` to display a preview grid for visual confirmation.
- Inject a massive array of PO lines into the database with a single transactional API request.
- Auto-calculate and append missing metrics (e.g., finding the `MaSP` dynamically if the user only provides `Barcode`).

**Non-Goals:**
- Real-time Excel sheet editing within the browser.
- Background jobs / queues for processing (we assume an Excel upload of max 1000 rows, which a synchronous transaction can comfortably handle under 3 seconds).
- Support for formats other than `.xlsx` (like `.csv` or `.xls`).

## Decisions

**1. Client-Side Excel Parsing vs Server-Side Parsing**
*Decision*: Parse the Excel file on the client using `xlsx` (SheetJS) and send a JSON array to the backend.
*Rationale*: Offloading parsing to the client reduces server memory footprint, prevents malicious file uploads (e.g. macro bombs) from reaching the Node layer directly, and allows us to instantly render a preview table on the frontend before any network request is even made.

**2. Transactional Integrity**
*Decision*: Use a Prisma `$transaction` inside `inventory.controller.ts`.
*Rationale*: If an Excel sheet has 99 valid rows and 1 invalid row (e.g., bad barcode), we MUST rollback the entire Purchase Order (`PhieuNhap`) to prevent partial data corruption. 

## Risks / Trade-offs

- **[Risk] Unrecognized Barcodes** → *Mitigation*: The backend will map incoming barcodes to the `SanPham` table. If any barcode doesn't exist, the transaction aborts and returns a `400 Bad Request` listing the exact problematic barcodes so the user can fix their Excel file.
- **[Risk] Date Parsing Issues** → *Mitigation*: Excel dates can be tricky. We will enforce a strict `YYYY-MM-DD` text format in the template or parse the Excel Epoch serial date safely using the `xlsx` library utility functions.
