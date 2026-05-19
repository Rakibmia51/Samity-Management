# 🚀 Project API Documentation

**Base URL:** `http://localhost:3000/api`

---

## 👥 Users

| Method | Endpoint | Description | Direct Link |
|:--- |:--- |:--- |:--- |
| GET | `/users` | Get all users | [Click Here](http://localhost:3000/api/users) |
| GET | `/users/member-search/:id` | Search member by ID | [Test mem-000004](http://localhost:3000/api/users/member-search/mem-000004) |

---

## 🏗️ Projects

| Method | Endpoint | Description | Direct Link |
|:--- |:--- |:--- |:--- |
| GET | `/projects` | Get all projects | [Click Here](http://localhost:3000/api/projects) |
| GET | `/projects/:id` | Specific project details | [View Project](http://localhost:3000/api/projects/69dcc266d7686f6bbaf4f535) |

---

## 📈 Shares Issues

| Method | Endpoint | Description | Direct Link |
|:--- |:--- |:--- |:--- |
| GET | `/shares` | Get all share records | [Click Here](http://localhost:3000/api/shares) |
| GET | `/shares/:id` | Specific share details | [View Share](http://localhost:3000/api/shares/69df1cf39b618df490e3d653) |
| GET | `/shares/latest-price/:id`| Latest price, availableShares, soldQuantity for a share | [View Price](http://localhost:3000/api/shares/latest-price/69dcbf21d7686f6bbaf4f534) |

---

## 💰 Share Sales

| Method | Endpoint | Description | Direct Link |
|:--- |:--- |:--- |:--- |
| GET | `/share-sales` | List all transactions | [Click Here](http://localhost:3000/api/share-sales) |

---
**Note:** Ensure your local server is running on port **3000** for the links to work.
