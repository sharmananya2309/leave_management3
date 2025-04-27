import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  standalone:true,
  selector: 'app-mainpage',
  imports: [RouterModule],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.css'
})
export class MainpageComponent {
  constructor(private router: Router) {}
  gotologin1(){
    console.log("Navigating...");
    this.router.navigate(['/register']);
  }
  gotologin() {
    console.log("Navigating...");
    this.router.navigate(['/login']);
  }
}
