import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-registerpage',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './registerpage.component.html',
  styleUrl: './registerpage.component.css'
})
export class RegisterpageComponent {
  name = '';
  username = '';
  email = '';
  contact = '';
  gender='';
  department = '';
  password = '';
  profileImage: File | null = null;
  role = '';

  departments = ['SALES', 'DEVELOPMENT', 'TESTING', 'MANAGEMENT', ''];

  onFileChange(event: any) {
    this.profileImage = event.target.files[0];
  }

  handleRegister(event: Event) {
    event.preventDefault();
    if (!this.name || !this.username || !this.email || !this.contact || !this.department || !this.password || !this.role || !this.gender) {
      alert('Please fill all fields properly.');
      return;
    }
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('username', this.username);
    formData.append('email', this.email);
    formData.append('num', this.contact);
    formData.append('dept', this.department);
    formData.append('password', this.password);
    formData.append('role', this.role);
    formData.append('gender', this.gender);
    if (this.profileImage) {
      formData.append('profile_image', this.profileImage);
    }
    

    fetch('http://localhost:5000/register', {
      method: 'POST',      //API to add data to our database 
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
      })
      .then(data => {
        alert('Registered successfully!');
        window.location.href = '/login';
      })
      .catch(error => alert(error.message));
  }
}
