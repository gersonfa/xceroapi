define({ "api": [
  {
    "type": "post",
    "url": "/api/auth/login",
    "title": "Login",
    "name": "Login",
    "group": "Authentication",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": ""
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": ""
          },
          {
            "group": "200 Success",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
    "groupTitle": "Authentication"
  },
  {
    "type": "post",
    "url": "/api/auth/register",
    "title": "Register user",
    "name": "Register",
    "group": "Authentication",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": ""
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": "<p>Nombre de usuario</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "full_name",
            "description": ""
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>User</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": ""
          },
          {
            "group": "200 Success",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
    "groupTitle": "Authentication"
  },
  {
    "type": "get",
    "url": "/api/group/place",
    "title": "Colony list",
    "name": "Colony_list",
    "group": "Colony",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "type": "Object[]",
            "optional": false,
            "field": "colonies",
            "description": "<p>Array de colonias</p>"
          },
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "colonies._id",
            "description": ""
          },
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "colonies.name",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Colony"
  },
  {
    "type": "get",
    "url": "/added",
    "title": "added to base",
    "name": "Added_to_base",
    "group": "DriverSockets",
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "optional": false,
            "field": "Object",
            "description": "<p>{base: String, position: Number}</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "DriverSockets"
  },
  {
    "type": "get",
    "url": "/api/new_service",
    "title": "new service",
    "name": "New_service",
    "group": "DriverSockets",
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "optional": false,
            "field": "Object",
            "description": "<p>service</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "DriverSockets"
  },
  {
    "type": "post",
    "url": "/update_location",
    "title": "update location",
    "name": "Update_location",
    "group": "DriverSockets",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "optional": false,
            "field": "Object",
            "description": "<p>{user_id: user_id, coords: [lng, lat]}</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "DriverSockets"
  },
  {
    "type": "get",
    "url": "/place",
    "title": "Place list",
    "name": "Place_list",
    "group": "Place",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "type": "Object[]",
            "optional": false,
            "field": "places",
            "description": "<p>Array de places puto fat</p>"
          },
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "places.name",
            "description": "<p>Nombre lugar.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Place"
  },
  {
    "type": "get",
    "url": "/api/service/:service_id/accept",
    "title": "Service accept",
    "name": "Service_accept",
    "group": "Service",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "optional": false,
            "field": "Object",
            "description": "<p>service updated</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Service"
  },
  {
    "type": "post",
    "url": "/api/service",
    "title": "Service create",
    "name": "Service_create",
    "group": "Service",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "origin_lat",
            "description": "<p>Latitud de origen</p>"
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "origin_lng",
            "description": "<p>Longitud de origen</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "origin_place",
            "description": "<p>id de origen de un objeto place (Opcional)</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "destiny_place",
            "description": "<p>id de destino de un objeto place (Opcional)</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "origin_colony",
            "description": "<p>id de origen de un objeto colony (Opcional)</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "destiny_colony",
            "description": "<p>id de origen de un objeto colony (Opcional)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "optional": false,
            "field": "Object",
            "description": "<p>service</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Service"
  },
  {
    "type": "get",
    "url": "/api/get_location",
    "title": "Service list",
    "name": "Service_list",
    "group": "Service",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "parameter": {
      "fields": {
        "query": [
          {
            "group": "query",
            "type": "String",
            "optional": false,
            "field": "origin_lng",
            "description": "<p>Longitud</p>"
          },
          {
            "group": "query",
            "type": "String",
            "optional": false,
            "field": "origin_lat",
            "description": "<p>Latitud</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "optional": false,
            "field": "object",
            "description": "<p>{place: object} devuelve un lugar si se encontro</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Service"
  },
  {
    "type": "get",
    "url": "/api/service",
    "title": "Service list",
    "name": "Service_list",
    "group": "Service",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "parameter": {
      "fields": {
        "query": [
          {
            "group": "query",
            "type": "String",
            "optional": false,
            "field": "state",
            "description": "<p>Por defecto es 'complete'</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "type": "Object[]",
            "optional": false,
            "field": "services",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Service"
  },
  {
    "type": "get",
    "url": "/api/tariff/check",
    "title": "Check Tariff",
    "name": "Check_Tariff",
    "group": "Tariff",
    "parameter": {
      "fields": {
        "query": [
          {
            "group": "query",
            "type": "String",
            "optional": false,
            "field": "colony_one",
            "description": ""
          },
          {
            "group": "query",
            "type": "String",
            "optional": false,
            "field": "colony_two",
            "description": ""
          },
          {
            "group": "query",
            "type": "String",
            "optional": false,
            "field": "place_one",
            "description": ""
          },
          {
            "group": "query",
            "type": "String",
            "optional": false,
            "field": "place_two",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "type": "Object",
            "optional": false,
            "field": "tariff",
            "description": ""
          },
          {
            "group": "200 Success",
            "type": "Number",
            "optional": false,
            "field": "tariff.cost",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/tariff.js",
    "groupTitle": "Tariff"
  },
  {
    "type": "get",
    "url": "/service_on_the_way",
    "title": "service on the way",
    "name": "Service_on_the_way",
    "group": "UserSockets",
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "optional": false,
            "field": "Object",
            "description": "<p>service</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "UserSockets"
  }
] });
