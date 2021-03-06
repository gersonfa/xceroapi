define({ "api": [
  {
    "type": "post",
    "url": "/api/auth/facebook",
    "title": "Facebbok Login",
    "name": "Facebook_Login",
    "group": "Authentication",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "facebook_id",
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
    "url": "/api/colony",
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
    "url": "/api/service_canceled",
    "title": "service canceled",
    "name": "service_canceled",
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
    "type": "put",
    "url": "/api/user/driver_leave_base",
    "title": "Leave base",
    "name": "Leave_base",
    "group": "Drivers",
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
            "field": "base",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Drivers"
  },
  {
    "type": "put",
    "url": "/api/user/update_image",
    "title": "Update image",
    "name": "Update_image",
    "group": "Drivers",
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
            "field": "image",
            "description": "<p>imagen en base64</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Drivers"
  },
  {
    "type": "post",
    "url": "/api/frequent",
    "title": "Frequent create",
    "name": "Frequent_create",
    "group": "Frequent",
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
            "type": "String",
            "optional": false,
            "field": "name",
            "description": ""
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": ""
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "lat",
            "description": ""
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "lng",
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
            "optional": false,
            "field": "Object",
            "description": "<p>frequent</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Frequent"
  },
  {
    "type": "post",
    "url": "/api/frequent/:frequent_id",
    "title": "Frequent delete",
    "name": "Frequent_delete",
    "group": "Frequent",
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
            "description": "<p>frequent</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Frequent"
  },
  {
    "type": "get",
    "url": "/api/frequent",
    "title": "Frequent list",
    "name": "Frequent_list",
    "group": "Frequent",
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
            "optional": true,
            "field": "frequent",
            "description": "<p>frequents</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Frequent"
  },
  {
    "type": "post",
    "url": "/api/frequent/:frequent_id",
    "title": "Frequent update",
    "name": "Frequent_update",
    "group": "Frequent",
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
            "type": "String",
            "optional": false,
            "field": "name",
            "description": ""
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": ""
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "lat",
            "description": ""
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "lng",
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
            "optional": false,
            "field": "Object",
            "description": "<p>frequent</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Frequent"
  },
  {
    "type": "get",
    "url": "/api/diver/:driver_id/inbox",
    "title": "Inbox list",
    "name": "Inbox_list",
    "group": "Inbox",
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
            "field": "inbox",
            "description": "<p>Array de inbox</p>"
          },
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "inbox._id",
            "description": ""
          },
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": ""
          },
          {
            "group": "200 Success",
            "type": "Number",
            "optional": false,
            "field": "date",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Inbox"
  },
  {
    "type": "get",
    "url": "/api/notice",
    "title": "Notice list",
    "name": "Notice_list",
    "group": "Notice",
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
            "field": "Notice",
            "description": "<p>Array de notice</p>"
          },
          {
            "group": "200 Success",
            "type": "String",
            "optional": false,
            "field": "body",
            "description": ""
          },
          {
            "group": "200 Success",
            "type": "Number",
            "optional": false,
            "field": "date",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Notice"
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
    "type": "post",
    "url": "/api/report",
    "title": "Report create",
    "name": "Report_create",
    "group": "Report",
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
            "type": "String",
            "optional": false,
            "field": "reason",
            "description": ""
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>commentario opcional</p>"
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "date",
            "description": "<p>gatTime del objeto date</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "service",
            "description": "<p>id del servicio</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "driver",
            "description": "<p>id del conductor</p>"
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
    "groupTitle": "Report"
  },
  {
    "type": "get",
    "url": "/api/driver_location/:driver_id",
    "title": "Get driver location",
    "name": "Get_driver_location",
    "group": "Service",
    "description": "<p>Esta ruta es para obtener la ubicación del conductor para que se muestre en el mapa en el transcurso del viaje.</p>",
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
            "type": "String",
            "optional": false,
            "field": "unit_number",
            "description": "<p>número de unidad</p>"
          },
          {
            "group": "200 Success",
            "type": "Array",
            "optional": false,
            "field": "coords",
            "description": "<p>coordenadas</p>"
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
    "title": "Get location",
    "name": "Get_location",
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
    "type": "delete",
    "url": "/api/service/:service_id/fee/:fee_id",
    "title": "Remove fee",
    "name": "Remove_fee",
    "group": "Service",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "parameter": {
      "fields": {
        "param": [
          {
            "group": "param",
            "type": "String",
            "optional": false,
            "field": "fee_id",
            "description": "<p>Id de cuota</p>"
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
    "type": "put",
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
    "type": "put",
    "url": "/api/service/:service_id/cancel",
    "title": "Service cancel",
    "name": "Service_cancel",
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
    "type": "put",
    "url": "/api/service/:service_id/end",
    "title": "Service end",
    "name": "Service_end",
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
            "field": "destiny_lat",
            "description": "<p>Latitud de origen</p>"
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "destiny_lng",
            "description": "<p>Longitud de origen</p>"
          },
          {
            "group": "body",
            "optional": false,
            "field": "end_time",
            "description": "<p>getTime del objeto date</p>"
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
    "type": "put",
    "url": "/api/service/:service_id/negate",
    "title": "Service negate",
    "name": "Service_negate",
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
    "type": "put",
    "url": "/api/service/:service_id/service_reject",
    "title": "Service reject",
    "name": "Service_reject",
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
            "field": "messge",
            "description": "<p>servicio asignado a otro conductor</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "Service"
  },
  {
    "type": "put",
    "url": "/api/service/:service_id/start",
    "title": "Service start",
    "name": "Service_start",
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
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "optional": false,
            "field": "start_time",
            "description": "<p>getTime del objeto date</p>"
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
    "url": "/api/service/:service_id/fee",
    "title": "Set fee",
    "name": "Set_fee",
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
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Nombre de cuota</p>"
          },
          {
            "group": "body",
            "type": "Number",
            "optional": false,
            "field": "price",
            "description": "<p>Precio de cuota</p>"
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
    "type": "put",
    "url": "/api/service/:service_id/price",
    "title": "Set price",
    "name": "Set_price",
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
            "field": "price",
            "description": "<p>Precio establecido por el conductor</p>"
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
            "field": "price",
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
    "type": "put",
    "url": "/api/user/change_password",
    "title": "Change password",
    "name": "Change_password",
    "group": "User",
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
            "type": "string",
            "optional": false,
            "field": "old_password",
            "description": "<p>Contraseña actual</p>"
          },
          {
            "group": "body",
            "type": "string",
            "optional": false,
            "field": "new_password",
            "description": "<p>Nueva contraseña</p>"
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
            "field": "message",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/emergency_disable",
    "title": "Emergency disable",
    "name": "Emergency_disable",
    "group": "User",
    "permission": [
      {
        "name": "Token"
      }
    ],
    "description": "<p>Solo lo puede desactivar el conductor o la administración</p>",
    "success": {
      "fields": {
        "200 Success": [
          {
            "group": "200 Success",
            "optional": false,
            "field": "emergency",
            "description": "<p>boolean</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/emergency_enable",
    "title": "Emergency enable",
    "name": "Emergency_enable",
    "group": "User",
    "description": "<p>se le envia un socket a los conductores cercanos 'emergency'</p>",
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
            "field": "service_id",
            "description": "<p>En caso de ser un cliente, mandar service_id</p>"
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
            "field": "emergency",
            "description": "<p>boolean</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/new_password",
    "title": "New password",
    "name": "New_password",
    "group": "User",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>Email de usuario</p>"
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
            "field": "message",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/:user_id/add_review",
    "title": "Review create",
    "name": "Review_create",
    "group": "User",
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
            "field": "rating",
            "description": "<p>Calificación del 1 al 5</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "comment",
            "description": "<p>comentario (Opcional)</p>"
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
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/inbox",
    "title": "new inbox",
    "name": "New_inbox",
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
  },
  {
    "type": "get",
    "url": "/service_end",
    "title": "service end",
    "name": "Service_end",
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
  },
  {
    "type": "get",
    "url": "/service_rejected",
    "title": "service rejected",
    "name": "Service_rejected",
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
  },
  {
    "type": "get",
    "url": "/service_started",
    "title": "service started",
    "name": "Service_started",
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
  },
  {
    "type": "get",
    "url": "/notice",
    "title": "new notice",
    "name": "new_notice",
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
  },
  {
    "type": "get",
    "url": "/api/user/user_status",
    "title": "Check user status",
    "name": "User_status",
    "group": "User",
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
            "field": "inService",
            "description": "<p>boolean</p>"
          },
          {
            "group": "200 Success",
            "optional": false,
            "field": "service",
            "description": "<p>service object if exist</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/index.js",
    "groupTitle": "User"
  }
] });
