# Address API Specification

## Create Address API

- Endpint : POST /api/address
- Header : Authorization : Bearer <acess_token>
- Request Body :

```json
{
  "addressType": "Rumah",
  "street": "Jl. Jalan",
  "city": "Bandung",
  "province": "Jawa Barat",
  "country": "Indonesia",
  "zipCode": "12345",
  "contactId": 1
}
```

- Response Sucess :

```json
{
  "errors": null,
  "message": "Address berhasil dibuat",
  "data": [
    {
      "id": 1,
      "addressType": "Rumah",
      "street": "Jl. Jalan",
      "city": "Bandung",
      "province": "Jawa Barat",
      "country": "Indonesia",
      "zipCode": "12345",
      "contactId": 1
    }
  ]
}
```

- Response Error :

```json
{
  "errors": ["Alamat harus diisi", "Negara harus diisi"],
  "message": "Address gagal dibuat",
  "data": null
}
```

## Get ALL Addresses

- Endpint : GET /api/address
- Header : Authorization : Bearer <acess_token>
- Request Body :

```json
{
  "errors": null,
  "message": "Get address berhasil",
  "data": [
    {
      "id": 1,
      "addressType": "Rumah",
      "street": "Jl. Jalan",
      "city": "Bandung",
      "province": "Jawa Barat",
      "country": "Indonesia",
      "zipCode": "12345",
      "contactId": 1
    }
  ]
}
```

- Response Error :

```json
{
  "errors": ["Address tidak ditemukan"],
  "message": "Get address gagal",
  "data": null
}
```

# Get Address by ID

- Endpint : GET /api/address/:id
- Header : Authorization : Bearer <acess_token>
- Request Body :
- Response Sucess :

```json
{
  "errors": null,
  "message": "Get address berhasil",
  "data": {
    "id": 1,
    "addressType": "Rumah",
    "street": "Jl. Jalan",
    "city": "Bandung",
    "province": "Jawa Barat",
    "country": "Indonesia",
    "zipCode": "12345",
    "contactId": 1
  }
}
```

- Response Error :

```json
{
  "errors": ["Address tidak ditemukan"],
  "message": "Get address gagal",
  "data": null
}
```

## Update Address by ID

- Endpint : PUT /api/address/:id
- Header : Authorization : Bearer <acess_token>
- Request Body :

```json
{
  "addressType": "Rumah",
  "street": "Jl. Jalan",
  "city": "Bandung",
  "province": "Jawa Barat",
  "country": "Indonesia",
  "zipCode": "12345",
  "contactId": 1
}
```

- Response Sucess :

```json
{
  "errors": null,
  "message": "Update address berhasil",
  "data": {
    "id": 1,
    "addressType": "Rumah",
    "street": "Jl. Jalan",
    "city": "Bandung",
    "province": "Jawa Barat",
    "country": "Indonesia",
    "zipCode": "12345",
    "contactId": 1
  }
}
```

- Response Error :

```json
{
  "errors": ["Address tidak ditemukan"],
  "message": "Update address gagal",
  "data": null
}
```

## Delete Address by ID

- Endpint : DELETE /api/address/:id
- Header : Authorization : Bearer <acess_token>
- Request Body :
- Response Sucess :

```json
{
  "errors": null,
  "message": "Delete address berhasil",
  "data": {
    "id": 1,
    "addressType": "Rumah",
    "street": "Jl. Jalan",
    "city": "Bandung",
    "province": "Jawa Barat",
    "country": "Indonesia",
    "zipCode": "12345",
    "contactId": 1
  }
}
```

- Response Error :

```json
{
  "errors": ["Address tidak ditemukan"],
  "message": "Delete address gagal",
  "data": null
}
```

## Address Statistics API

- Endpoint : GET /api/contacts/stats
- Header : Authorization : Bearer <acess_token>
- Response Success :

```json
{
  "errors": null,
  "message": "Address statistics retrieved successfully",
  "data": {
    "totalAddresses": 15,
    "addressTypes": [
      {
        "type": "Rumah",
        "count": 8
      },
      {
        "type": "Kantor",
        "count": 5
      },
      {
        "type": "Apartemen",
        "count": 2
      }
    ]
  }
}
```

- Response Error :

```json
{
  "errors": ["Internal server error"],
  "message": "Failed to retrieve statistics",
  "data": null
}
```
