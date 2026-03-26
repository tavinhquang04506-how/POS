# Sơ đồ Use Case Diagram tổng quan

Dưới đây là sơ đồ Use Case tổng quan được vẽ lại từ hình ảnh trong tài liệu của bạn. Mình cung cấp cho bạn 2 định dạng phổ biến nhất là **Mermaid** (có thể xem trực tiếp trên GitHub/Notion/Markdown) và **PlantUML** (chuyên dụng để vẽ biểu đồ UML chuẩn với hình người).

### 1. Sơ đồ Mermaid
Bạn có thể copy đoạn code này dán vào bất kỳ trình soạn thảo Markdown nào có hỗ trợ Mermaid (như GitHub, Notion, Obsidian,...) để hiển thị.

```mermaid
flowchart LR
    %% Định nghĩa các Actor (Tác nhân)
    NVTN((Nhân viên\nthu ngân))
    NVQL((Nhân viên\nquản lý))
    
    %% Khung Hệ thống
    subgraph System["Hệ Thống Siêu Thị POS"]
        direction TB
        UC1([Quản lý hàng])
        UC2([Bán hàng])
        UC3([Lập Hóa đơn])
        UC4([Xử lý thanh toán])
        UC5([Quản lý thành viên])
        UC6([Xử lý hủy])
        UC7([Trả hàng])
        UC8([Kết xuất báo cáo])
    end

    NVK((Nhân viên\nkho))
    KH((Khách hàng))

    %% Các mối quan hệ từ trái sang phải
    NVTN --- UC2
    NVTN --- UC3
    NVTN --- UC4
    NVTN --- UC5

    NVQL --- UC5
    NVQL --- UC6
    NVQL --- UC7
    NVQL --- UC8

    %% Các mối quan hệ từ phải sang trái (để layout đẹp hơn)
    UC1 --- NVK
    UC4 --- KH
    UC5 --- KH

    %% Style
    classDef actor fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef usecase fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    class NVTN,NVQL,NVK,KH actor;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8 usecase;
```

### 2. Định dạng PlantUML (Đề xuất)
PlantUML là chuẩn phổ biến nhất để vẽ Use Case, nó sẽ vẽ ra hình các "người que" (stickman) và khung hệ thống hoàn hảo giống hệt trong file Word của bạn. Bạn có thể dán code dưới đây vào trang web [PlantText](https://www.planttext.com/) hoặc [PlantUML Web](https://www.plantuml.com/plantuml/uml/) để xuất ra hình ảnh nhé:

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Nhân viên thu ngân" as Cashier
actor "Nhân viên quản lý" as Manager
actor "Nhân viên kho" as Warehouse
actor "Khách hàng" as Customer

rectangle "Hệ Thống Siêu Thị POS" {
  usecase "Quản lý hàng" as UC1
  usecase "Bán hàng" as UC2
  usecase "Lập Hóa đơn" as UC3
  usecase "Xử lý thanh toán" as UC4
  usecase "Quản lý thành viên" as UC5
  usecase "Xử lý hủy" as UC6
  usecase "Trả hàng" as UC7
  usecase "Kết xuất báo cáo" as UC8
}

Cashier -- UC2
Cashier -- UC3
Cashier -- UC4
Cashier -- UC5

Manager -- UC5
Manager -- UC6
Manager -- UC7
Manager -- UC8

UC1 -- Warehouse

UC4 -- Customer
UC5 -- Customer
@enduml
```

### 📋 Phân tích các quyền hạn (Actor - Use Case)
Theo bản vẽ của bạn, hệ thống được cấu trúc tương tác như sau:

*   **Nhân viên thu ngân** tham gia vào 4 chức năng: *Bán hàng, Lập Hóa đơn, Xử lý thanh toán, Quản lý thành viên*.
*   **Nhân viên quản lý** tham gia vào 4 chức năng: *Quản lý thành viên, Xử lý hủy, Trả hàng, Kết xuất báo cáo*.
*   **Nhân viên kho** chỉ tham gia vào 1 chức năng: *Quản lý hàng*.
*   **Khách hàng** tham gia vào 2 chức năng: *Xử lý thanh toán, Quản lý thành viên*.
