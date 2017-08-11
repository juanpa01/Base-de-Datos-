var express = require('express');
var router = express.Router();
var mysql = require('mysql');


/*------------ DATABASE CONNECTION ----------------*/
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'ander1096',
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

/*--------------------------------------------------------*/



/* Recibir LOGIN */
router.post('/login',function(req,res,next){
  try{
    var obj = req.body;
    if(obj.login_pass == 'root' && obj.login_user == 'root'){
      res.redirect('/');
    }else{
      res.redirect('/');
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


module.exports = router;
