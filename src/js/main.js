// Import our custom CSS
import '../scss/styles.scss';

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';

import $ from "jquery";

$(function () {

   function LoadComponent(page) {
      $.ajax({
         method: 'get',
         url: page,
         success: (response) => {
            $("main").html(response);
         }
      })
   }
   function LoadAppointment(uid) {
      $('#appointmentContainer').html("");
      $.ajax({
         method: 'get',
         url: `https://to-do-backend-3-jhl1.onrender.com/appointment/${uid}`,
         success: (appointments) => {
            $("#UserIdContainer").append(`<span>${sessionStorage.getItem("username")}</span>`);
            appointments.map(item => {
               $(`
          <div class="alert alert-dismissible alert-success">
              <h2>${item.Title}</h2>
              <button value=${item.Id} id="btnDeleteTask" class="btn btn-close"></button>
              <p> ${item.Description} </p>
              <div>
                 <span class="bi bi-clock"> </span> ${item.Date}
              </div>
              <div class="text-end">
              <button value=${item.Id} id="btnEditTask" class="bi bi-pen-fill btn btn-primary">Edit</button>
              </div>
          </div>
        `).appendTo("#appointmentsContainer");
            })
         }
      })
   }

   $("#btnHomeLogin").click(() => {
      LoadComponent('login.html');
   })

   $("#btnHomeRegister").click(() => {
      LoadComponent('register.html')
   })

   $(document).on("click", "#btnNavLogin", () => {
      LoadComponent('login.html');
   })

   $(document).on("click", "#btnNavRegister", () => {
      LoadComponent('register.html');
   })

   $(document).on("click", "#btnLogin", () => {
      $.ajax({
         method: 'get',
         url: 'https://to-do-backend-3-jhl1.onrender.com/users',
         success: (users) => {

            var user = users.find(item => item.UserId === $("#txtId").val());
            console.log(user);
            if (user) {
               if (user.Password === $("#txtPassword").val()) {
                  sessionStorage.setItem("username", user.UserName);
                  sessionStorage.setItem("userid", user.UserId)
                  LoadComponent('appointments.html');
                  LoadAppointment($("#txtId").val());
               }
               else {
                  $("#lblError").html("Invalid Credentials");
               }
            }
            else {
               $("#lblError").html("User Not Found");
            }
         }
      })

   })

   $(document).on("click", "#btnSignout", () => {
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("userid");
      LoadComponent('login.html');
   });

   $(document).on("click", "#btnRegister", () => {
      var user = {
         UserId: $("#RId").val(),
         UserName: $("#RUname").val(),
         Password: $("#RPassword").val(),
         Email: $("#REmail").val(),
         Mobile: $("#RMobile").val()
      };
      $.ajax({
         method: 'post',
         url: 'https://to-do-backend-3-jhl1.onrender.com/register-user',
         data: user

      })
      console.log(user);
      alert('Register Successfully..');
      LoadComponent('login.html');

   });

   

   $(document).on("click", "#btnNewTask", () => {
      LoadComponent('new-task.html');
   });
   
   $(document).on("click", "#btnCreateTask", () => {
      var task = {
         Id: parseInt($("#TaskId").val()),
         Date: new Date($("#TaskDate").val()),
         Title: $("#TaskTitle").val(),
         Description: $("#TaskDescription").val(),
         UserId: sessionStorage.getItem("userid")
      };
     
      $.ajax({
         method: 'post',
         url: 'https://to-do-backend-3-jhl1.onrender.com/add-task',
         data: task

      })
      console.log(task);
      alert('Appointment Added Successfully..');
      LoadComponent('appointments.html');
      LoadAppointment(sessionStorage.getItem("userid"));
   })

   $(document).on("click", "#btnDeleteTask", (e) => {
      var flag = confirm('Are your sure\nWant to Delete?');
      if (flag == true) {
         $.ajax({
            method: 'delete',
            url: `https://to-do-backend-3-jhl1.onrender.com/delete-task/${e.target.value}`
         })
         alert('Deleted Successfully..');
         LoadComponent('appointments.html');
         LoadAppointment(sessionStorage.getItem("userid"));
      }
   });
   $(document).on("click", "#btnEditTask", (e) => {
      LoadComponent("Edit-task.html");
      $.ajax({
         method: 'get',
         url: `https://to-do-backend-3-jhl1.onrender.com/get-byid/${e.target.value}`,
         success: (appointments) => {
            $("#UpdateId").val(parseInt(appointments[0].Id));
            $("#UpdateTitle").val(appointments[0].Title);
            $("#UpdateDescription").val(appointments[0].Description);
            $("#UpdateDate").val(formatDate(appointments[0].Date));
            $("#UpdateUserId").val(appointments[0].UserId);
         }
      });
   });
   
   function formatDate(dateString){
      var parts = dateString.split('/');
      if(parts.length === 3){
         return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      else{
         return dateString
      }
   }

   $(document).on("click", "#btnUpdateTask", () => {
      var updatedAppointment = {
         Id: $("#UpdateId").val(),
         Date: new Date($("#UpdateDate").val()),
         Title: $("#UpdateTitle").val(),
         Description: $("#UpdateDescription").val(),
         UserId: $("#UpdateUserId").val()
      };
      
      $.ajax({
         method: 'PUT',
         url: `https://to-do-backend-3-jhl1.onrender.com/edit-task/${updatedAppointment.Id}`,
         data: updatedAppointment
      })
      console.log(updatedAppointment);
      alert('Appointment Updated Successfully..');
      LoadComponent('appointments.html');
      LoadAppointment(sessionStorage.getItem("userid"));
   })

});