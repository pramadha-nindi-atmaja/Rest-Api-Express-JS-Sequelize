# User API Sfesification

## Register User API

- Endpint : POST /api/users
- Request Body :

```json
{
  "name": "Pojok Code",
  "email": "pojokcode@gmail.com",
  "password": "pojokcode"
}
```

- Response Sucess :

```json
{
  "errors": null,
  "message": "Activasi akun telah dikirim ke email anda",
  "data": [
    {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Pojok Code",
      "email": "pojokcode@gmail.com"
    }
  ]
}
```

- Response Error :

```json
{
  "errors": ["Email harus diisi", "Password harus diisi"],
  "message": "Process gagal",
  "data": null
}
```

## Email Activation Akun

- Endpint : GET /api/users/:uuid
  link di kirimkan ke email untuk di klik activasinya
- Response Sucess :

```json
{
  "errors": null,
  "message": "Akun anda telah aktif",
  "data": [
    {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Pojok Code",
      "email": "pojokcode@gmail.com"
    }
  ]
}
```

- Response Error :

```json
{
  "errors": ["activasi sudah expire"],
  "message": "Process gagal",
  "data": null
}
```

## Login User API

- Endpint : POST /api/users/login
- Request Body :

```json
{
  "email": "pojokcode@gmail.com",
  "password": "pojokcode"
}
```

- Response Sucess :

```json
{
  "errors": null,
  "message": "Login berhasil",
  "data": [
    {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Pojok Code",
      "email": "pojokcode@gmail.com"
    }
  ],
  "acess_token": "xxxxxxxxxxxxxxxxxxxxxxxxx",
  "refresh_token": "xxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

- Response Error :

```json
{
  "errors": ["Email atau password salah"],
  "message": "Login gagal",
  "data": null
}
```

## Refresh Token

- Endpint : POST /api/users/refresh
- Header : Authorization : Bearer <acess_token>
- Request Body :
- Response Sucess :

```json
{
  "errors": null,
  "message": "Refresh token berhasil",
  "data": [
    {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Pojok Code",
      "email": "pojokcode@gmail.com"
    }
  ],
  "acess_token": "xxxxxxxxxxxxxxxxxxxxxxxxx",
  "refresh_token": "xxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

- Response Error :

```json
{
  "errors": ["Token tidak valid"],
  "message": "Refresh token gagal",
  "data": null
}
```

## Get User API

- Endpint : GET /api/users/:id
- Header : Authorization : Bearer <acess_token>
- Request Body :
- Response Sucess :

```json
{
  "errors": null,
  "message": "Get user berhasil",
  "data": [
    {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Pojok Code",
      "email": "pojokcode@gmail.com"
    }
  ]
}
```

- Response Error :

```json
{
  "errors": ["User tidak ditemukan"],
  "message": "Get user gagal",
  "data": null
}
```

## Update User API

- Endpint : PUT /api/users/:id
- Header : Authorization : Bearer <acess_token>
- Request Body :

```json
{
  "name": "Pojok Code",
  "email": "pojokcode@gmail.com",
  "password": "pojokcode"
}
```

- Response Sucess :

```json
{
  "errors": null,
  "message": "Update user berhasil",
  "data": [
    {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Pojok Code",
      "email": "pojokcode@gmail.com"
    }
  ]
}
```

- Response Error :

```json
{
  "errors": ["User tidak ditemukan"],
  "message": "Update user gagal",
  "data": null
}
```

## Delete User API

- Endpint : DELETE /api/users/:id
- Header : Authorization : Bearer <acess_token>
- Request Body :
- Response Sucess :

```json
{
  "errors": null,
  "message": "Delete user berhasil",
  "data": [
    {
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Pojok Code",
      "email": "pojokcode@gmail.com"
    }
  ]
}
```

- Response Error :

```json
{
  "errors": ["User tidak ditemukan"],
  "message": "Delete user gagal",
  "data": null
}
```

## Search Contacts API

- Endpoint : GET /api/contacts/search?query=:query
- Header : Authorization : Bearer <access_token>
- Response Success :

```json
{
  "errors": null,
  "message": "Search completed successfully",
  "data": [
    {
      "id": 1,
      "firstName": "Pojok",
      "lastName": "Code",
      "fullName": "Pojok Code",
      "email": "email1@kontak.com",
      "phone": "123456789",
      "userId": "xxxxxxxxxxxxxxxxxxxxxxxxx",
      "address": [
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
  ]
}
```

- Response Error :

```json
{
  "errors": ["Query parameter is required"],
  "message": "Search failed",
  "data": null
}
```

## Contact Statistics API

- Endpoint : GET /api/contacts/stats
- Header : Authorization : Bearer <access_token>
- Response Success :

```json
{
  "errors": null,
  "message": "Contact statistics retrieved successfully",
  "data": {
    "totalContacts": 10,
    "contactsWithAddress": 8,
    "addressTypes": [
      {
        "type": "Rumah",
  "count": 5
      },
      {
        "type": "Kantor",
        "count": 3
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
