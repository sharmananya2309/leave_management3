import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-loginpage',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.scss'
})
export class LoginpageComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false; // ✅ Define showPassword
  
  saveUserToLocalStorage(user: any, token: string) {
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('name', user.name);
    localStorage.setItem('role', user.role);
    localStorage.setItem('token', token);
    localStorage.setItem('department', user.department);
    localStorage.setItem('user', JSON.stringify(user));
  }

  handleLogin(event: Event) {
    event.preventDefault();
    
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: this.email, password: this.password })
    })
    .then(response => {
      if (!response.ok) throw new Error('Invalid credentials');
      return response.json();
    })
    .then(data => {
      console.log("logged in user", data);
      this.saveUserToLocalStorage(data.user, data.token);
      setTimeout(() => {   
        if (data.user.role === "hod") {
          window.location.href = '/hod';
        } else {
          window.location.href = "/staff";
        }
      }, 100);  
    })
    .catch(error => alert(error.message));
  }
}

