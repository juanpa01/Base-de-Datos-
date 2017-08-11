var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dialog = require('dialog');
var validator = require('validator');


/*------------ DATABASE CONNECTION ----------------*/
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'juan9611',
  database : 'C_infracciones'
});

connection.connect(function(err,res){
  if(err){
    throw err;
  }else{
    console.log('Conexion establecida');
  }
});

/*-------------------------------------------------*/


/*-------------- ENRUTAMIENTOS ---------------------------*/


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* GET consult_code page */
router.get('/login_consult', function(req, res, next) {
  res.render('login_consult');
});

/* GET consult page */
router.get('/consult', function(req, res, next) {
  res.render('consult');
});


/* GET root page */
router.get('/root', function(req, res, next) {
  res.render('root');
});

// GET register_mult page
router.get('/register_mult', function(req, res, next){
  res.render('register_mult');
});

// GET delete_person page
router.get('/delete_person', function(req, res, next){
  consult = 'SELECT * FROM Persona';
  connection.query(consult,function(err,result){
    if(err){
      throw err;
    }
    res.render('delete_person', {person: result});
  });
});


// GET update_person page
router.get('/update_person', function(req, res, next){
  consult = 'SELECT * FROM Persona';
  connection.query(consult,function(err,result){
    if(err){
      throw err;
    }
    res.render('update_person', {person: result});
  });
});



/*--------------------------------------------------------*/



/* Recibir LOGIN */
router.post('/login',function(req,res,next){
  try{
    var obj = req.body;
    if(obj.login_pass == 'root' && obj.login_user == 'root'){
      res.redirect('/root')
    }else{
      dialog.info('Usuario incorrecto', 'Error!', function(err){
        if (!err) console.log('User clicked OK');
      })
      res.render('login')
    }
  }
  catch(ex){
    console.error("Internal error:" + ex);
    return next(ex);
  }
});



/* Recibir CONSULTA  */
router.post('/consult',function(req,res,next){
  try{

      var obj = req.body;
      con = 'SELECT M.id_multa, M.fecha_multa, M.importe_multa, M.id_vehiculo, M.articulo_multa, L.carretera_lugarInfraccion,L.kilometro_lugarInfraccion, L.dir_lugarInfraccion, P.id_persona, P.nombre_persona, P.apellido_persona, A.id_agente, A.nombre_agente, A.apellido_agente FROM Persona as P, Multa as M, Lugar_Infraccion as L, Agente as A WHERE M.id_persona = ? AND P.id_persona = ? AND M.id_lugarInfraccion = L.id_lugarInfraccion AND A.id_agente = M.id_agente';
      con_modelo = 'SELECT IF(M.id_persona = ? AND M.id_vehiculo IS NOT NULL,(select V.modelo_vehiculo from Vehiculo as V WHERE V.matricula_vehiculo = M.id_vehiculo), "No Aplica") as result FROM Multa as M WHERE M.id_persona IN (SELECT Multa.id_persona FROM Multa WHERE Multa.id_persona = ?)';
      con_marca = 'SELECT IF(M.id_persona = ? AND M.id_vehiculo IS NOT NULL,(select V.marca_vehiculo from Vehiculo as V WHERE V.matricula_vehiculo = M.id_vehiculo), "No Aplica") as result FROM Multa as M WHERE M.id_persona IN (SELECT Multa.id_persona FROM Multa WHERE Multa.id_persona = ?)';
      con_matricula = 'SELECT IF(M.id_persona = ? AND M.id_vehiculo IS NOT NULL,(select V.matricula_vehiculo from Vehiculo as V WHERE V.matricula_vehiculo = M.id_vehiculo), "No Aplica") as result FROM Multa as M WHERE M.id_persona IN (SELECT Multa.id_persona FROM Multa WHERE Multa.id_persona = ?)';
      connection.query(con,[obj.user_code, obj.user_code],function(err, multa_res){
          if(err){
            throw err;
          }
          connection.query(con_matricula,[obj.user_code, obj.user_code],function(err, matricula_result){
            if(err){
              throw err;
            }else{
              connection.query(con_modelo,[obj.user_code, obj.user_code],function(err, modelo_result){
                if(err){
                  throw err;
                }else{
                    connection.query(con_marca,[obj.user_code,obj.user_code],function(err, marca_result){
                      if(err){
                        throw err;
                      }else{
                        res.render('consult',{multa: multa_res, marca: marca_result, modelo: modelo_result, a: 0, matricula: matricula_result});
                      }
                    });
                }
              });
            }
          });


      });
    }


  catch(ex){
    console.error("Internal error:" + ex);
    return next(ex);
  }
});


//Actualizar datos persona
router.post('/update_person',function(req,res,next){
  try {
    var obj = req.body;
    if (validator.isNumeric(obj.id)){
      var id = obj.id;
      if (obj.columna == 'Identificacion'){
        var data = {id_persona: obj.inf};
        var possible = true;
      }
      if (obj.columna == 'Nombre'){
        var data = {nombre_persona: obj.inf};
        var possible = true;
      }
      if (obj.columna == 'Apellido'){
        var data = {apellido_persona: obj.inf};
        var possible = true;
      }
      if (obj.columna == 'Direccion'){
        var data = {direccion_persona: obj.inf};
        var possible = true;
      }
      if (obj.columna == 'Fecha de nacimiento'){
        var data = {fecha_nacimiento: obj.inf};
        var possible = true;
      }
      if (obj.columna == 'Tipo'){
        var data = {tipo_persona: obj.inf};
        var possible = true;
      }

      if (possible == true){
        up = 'UPDATE Persona SET ? WHERE id_persona = ?';
        connection.query(up, [data, id],function(err,result){
          if(err){
            throw err;
          }
          console.log("se realizo la actualizacion");
        });
      }
    }else {
      console.log("error en identificacion");
    }
    //vuelve a cargar la pagina con datos actualizados
    consult = 'SELECT * FROM Persona';
    connection.query(consult,function(err,result){
      if(err){
        throw err;
      }
      res.render('update_person', {person: result});
    });

  } catch (e) {
    console.error("Internal error:" + ex);
    return next(ex);
  }
});


//Eliminar Multa
router.post('/delete_person',function(req,res,next){
  try {
    var obj = req.body;
    if (validator.isNumeric(obj.id)){
      delet = 'DELETE FROM Persona WHERE id_persona = ?';
      connection.query(delet,obj.id,function(err, res){
        if(err){
          throw err;
        }
      });
    } else {
      console.log("error en identificacion");
    }
    //vuelve a cargar la pagina con datos actualizados
    consult = 'SELECT * FROM Persona';
    connection.query(consult,function(err,result){
      if(err){
        throw err;
      }
      res.render('delete_person', {person: result});
    });
  } catch (ex) {
    console.error("Internal error:" + ex);
    return next(ex);
  }


});


//Ingresar multa
router.post('/register_mult',function(req,res,next){
  try {
    var obj = req.body;

    if (validator.isNumeric(obj.id) && validator.isNumeric(obj.id_agent) && obj.person != null && obj.vehiculo != null){
      if (obj.person == 'no' && validator.isNumeric(obj.id)){
        var id = obj.id.replace(/[^0-9]/g, '');
        var data_person = {id_persona: id, nombre_persona: obj.name, apellido_persona: obj.last_name, direccion_persona: obj.dir, fecha_nacimiento: obj.date_person, tipo_persona: obj.tipo};
        ins = 'INSERT INTO Persona SET ?';
        connection.query(ins,data_person,function(err, res){
          if(err){
            throw err;
          }
          console.log("insercion completa en persona");
        });
      }else{
        var id = obj.id.replace(/[^0-9]/g, '');
      }

      //datos y conexion a la tabla de vehiculo, solo si el auto participo en la multa
      if (obj.vehiculo == 'si' && validator.isNumeric(obj.matricula)){
        var id_vehi = obj.matricula;
        var data_vehi = {matricula_vehiculo: obj.matricula, modelo_vehiculo: obj.modelo, marca_vehiculo: obj.marca, fecha_matricula: obj.date_vehi, id_propietario: id};
        ins2 = 'INSERT INTO Vehiculo SET ?';
        connection.query(ins2,data_vehi,function(err, res){
          if(err){
            throw err;
          }
          console.log("insercion completa en vehiculo");
        });
      } else{
        var id_vehi = null;
        var data_vehi = {};
        console.log("No tuvo que agregar vehiculo ó matricula de vehiculo mal escrito");
      }

      //datos y conexion para lugar de infraccion y multa
      var data_lugar_infracion = {carretera_lugarInfraccion: obj.carretera, kilometro_lugarInfraccion: obj.km, dir_lugarInfraccion: obj.dir_mult};
      ins3 = 'INSERT INTO Lugar_Infraccion SET ?';
      connection.query(ins3,data_lugar_infracion,function(err, res){
        if(err){
          throw err;
        }
        console.log("Inserccion completa en lugar de infraccion");
        var id_lugar = res.insertId;
        var data_mult = {fecha_multa: obj.date_mult, importe_multa: obj.importe,articulo_multa: obj.articulo, id_persona: id, id_vehiculo: id_vehi, id_lugarInfraccion: id_lugar, id_agente: obj.id_agent };
        ins4 = 'INSERT INTO Multa SET ?';
        connection.query(ins4,data_mult,function(err, res){
          if(err){
            throw err;
          }
          console.log("insercion completa en Multa");
        });
      });
      res.render('register_mult');

    }else {
      console.log("error al ingresar el id del agente o de la persona");
      res.render('register_mult');
    }
  }

  catch (ex) {
    console.error("Internal error:" + ex);
    return next(ex);
  }
  });

//Pagina root
router.post('/root',function(req,res,next){
  if(req.body.boton == 'Ingresar Multa'){
    res.redirect('/register_mult');
  }
  if(req.body.boton == 'Eliminar Persona'){
    res.redirect('/delete_person');
  }
  if(req.body.boton == 'Actualizar datos de persona'){
    res.redirect('/update_person');
  }

});


module.exports = router;
