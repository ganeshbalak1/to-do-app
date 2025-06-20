import "../scss/styles.scss";
import * as bootstrap from "bootstrap";
import $ from "jquery";

$(function () {
   const api = "http://127.0.0.1:7070";

   function ShowWelcomeScreen() {
      $("main").addClass("d-none").empty();
      $(".hero-container").removeClass("d-none");
      window.scrollTo(0, 0);
   }

   function LoadComponent(page) {
      $(".hero-container").addClass("d-none");
      $("main").removeClass("d-none").html(`
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `);

      $.ajax({
         method: "get",
         url: page,
         success: (response) => {
            $("main").html(response);
            window.scrollTo(0, 0);
         },
         error: () => {
            $("main").html(`<div class="alert alert-danger mt-4">Page not found: ${page}</div>`);
         }
      });
   }

   function LoadAppointment(uid) {
      $("#appointmentsContainer").html("");
      $.get(`${api}/appointment/${uid}`, (appointments) => {
         $("#UserIdContainer").html(`<span>${sessionStorage.getItem("username")}</span>`);
         appointments.forEach((item) => {
            $(`
               <div class="alert alert-dismissible alert-success">
                  <h2>${item.Title}</h2>
                  <button value="${item.Id}" id="btnDeleteTask" class="btn btn-close"></button>
                  <p>${item.Description}</p>
                  <div><span class="bi bi-clock"></span> ${formatDateDisplay(item.Date)}</div>
                  <div class="text-end">
                     <button value="${item.Id}" id="btnEditTask" class="bi bi-pen-fill btn btn-primary">Edit</button>
                  </div>
               </div>`
            ).appendTo("#appointmentsContainer");
         });
      });
   }

   function formatDateDisplay(dateString) {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
   }

   function formatDateInput(dateString) {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
   }

   // NAVIGATION BUTTONS
   $(document).on("click", "#btnHomeLogin, #btnNavLogin", () => LoadComponent("login.html"));
   $(document).on("click", "#btnHomeRegister, #btnNavRegister", () => LoadComponent("register.html"));
   $(document).on("click", "#btnSignout", () => {
      sessionStorage.clear();
      ShowWelcomeScreen();
   });
   $(document).on("click", "#btnNewTask", () => LoadComponent("new-task.html"));

   // LOGIN
   $(document).on("submit", "#loginForm", function (e) {
      e.preventDefault();
      const userId = $("#txtId").val().trim();
      const password = $("#txtPassword").val().trim();

      if (!userId || !password) {
         $("#lblError").text("Please enter both User ID and Password");
         return;
      }

      $.get(`${api}/all-users`, (users) => {
         const user = users.find((u) => u.UserId === userId);
         if (user && user.Password === password) {
            sessionStorage.setItem("username", user.UserName);
            sessionStorage.setItem("userid", user.UserId);
            LoadComponent("appointments.html");
            setTimeout(() => LoadAppointment(user.UserId), 300);
         } else {
            $("#lblError").text(user ? "Invalid Credentials" : "User Not Found");
         }
      });
   });

   // REGISTER
   $(document).on("submit", "#registerForm", function (e) {
      e.preventDefault();

      const userId = $("#RId").val().trim();
      const userName = $("#RUname").val().trim();
      const password = $("#RPassword").val().trim();
      const email = $("#REmail").val().trim();
      const mobile = $("#RMobile").val().trim();

      if (!userId || !userName || !password || !email || !mobile) {
         alert("All fields are mandatory.");
         return;
      }

      const user = { UserId: userId, UserName: userName, Password: password, Email: email, Mobile: mobile };

      $.post(`${api}/register-user`, user, () => {
         alert("Registered Successfully.");
         LoadComponent("login.html");
      });
   });

   // CREATE TASK
   $(document).on("submit", "#newTaskForm", function (e) {
      e.preventDefault();
      const task = {
         Id: parseInt($("#TaskId").val()),
         Date: new Date($("#TaskDate").val()),
         Title: $("#TaskTitle").val(),
         Description: $("#TaskDescription").val(),
         UserId: sessionStorage.getItem("userid"),
      };
      $.post(`${api}/add-task`, task, () => {
         alert("Appointment Added Successfully.");
         LoadComponent("appointments.html");
         setTimeout(() => LoadAppointment(task.UserId), 300);
      });
   });

   // DELETE TASK
   $(document).on("click", "#btnDeleteTask", (e) => {
      if (confirm("Are you sure you want to delete this task?")) {
         $.ajax({
            method: "delete",
            url: `${api}/delete-task/${e.target.value}`,
            success: () => {
               alert("Deleted Successfully.");
               LoadComponent("appointments.html");
               setTimeout(() => LoadAppointment(sessionStorage.getItem("userid")), 300);
            },
         });
      }
   });

   // EDIT TASK
   $(document).on("click", "#btnEditTask", (e) => {
      const taskId = e.target.value;
      LoadComponent("Edit-task.html");
      setTimeout(() => {
         $.get(`${api}/appointment/by-id/${taskId}`, (appointments) => {
            const item = appointments[0];
            $("#UpdateId").val(item.Id);
            $("#UpdateTitle").val(item.Title);
            $("#UpdateDescription").val(item.Description);
            $("#UpdateDate").val(formatDateInput(item.Date));
            $("#UpdateUserId").val(item.UserId);
         });
      }, 300);
   });

   // UPDATE TASK
   $(document).on("click", "#btnUpdateTask", () => {
      const task = {
         Id: parseInt($("#UpdateId").val()),
         Date: new Date($("#UpdateDate").val()),
         Title: $("#UpdateTitle").val(),
         Description: $("#UpdateDescription").val(),
         UserId: $("#UpdateUserId").val(),
      };
      $.ajax({
         method: "PUT",
         url: `${api}/edit-task/${task.Id}`,
         data: task,
         success: () => {
            alert("Appointment Updated Successfully.");
            LoadComponent("appointments.html");
            setTimeout(() => LoadAppointment(task.UserId), 300);
         },
      });
   });
});
