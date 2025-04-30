import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { CalenderComponent } from '../calender/calender.component';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { trigger,state,style,transition,animate } from '@angular/animations';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
@Component({
  selector: 'app-staffpage',
  standalone: true,
  imports: [CommonModule, FormsModule, InfiniteScrollDirective,CalenderComponent],
  templateUrl: './staffpage.component.html',
  styleUrls: ['./staffpage.component.scss'],
  animations:[
    trigger('slideInOut',[
      state('in',style({transform:'translate(-100%)'})),
      state('out',style({transform:'translate(0)'})),
      transition('in<=>out',animate('300ms ease-in-out'))
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class StaffpageComponent implements OnInit {
  userId = localStorage.getItem('user_id');
  userName = localStorage.getItem('name') || 'User';
  leaves: any = {};
  leaveHistory: any[] = [];
  leaveStatus = 'No pending requests';
  visibleSection: 'balance' | 'status' | 'history' | 'rules' = 'balance';
  userData: any={};     //to store user info for profile pic
  profilePicUrl: string = '';
  sidebarOpen=true;
  holidays:any[]=[];
  page = 0;
  loading = false;
  today = new Date();     //for calender
  selectedDate: string = '';  
 
  ngOnInit() {
    this.loadMoreHolidays();
    if (this.userId) {
      this.fetchLeaveBalance();
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userData = JSON.parse(storedUser);
      this.userName = this.userData.name || 'User';

      if (this.userData.profile_image) {
        this.profilePicUrl = `http://localhost:5000/${this.userData.profile_image}`;
      } else if (this.userData.gender === 'male') {
        this.profilePicUrl = 'maledefaultpp.png';
      } else {
        this.profilePicUrl = 'femaledefaultpp.png';
      } 
    }
  }
  //for holiday card
  loadMoreHolidays() {
    this.loading = true;
    this.http.get<any[]>(`http://localhost:5000/public_holidays`).subscribe({
      next: (holidays) => {
        const today = new Date();
        const upcomingHolidays = holidays.filter(holiday => {
          const holidayDate = new Date(holiday.date.iso);
          return holidayDate > today;
        });
  
        this.holidays = [...this.holidays, ...upcomingHolidays];
        this.page++;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error fetching holidays", error);
        this.loading = false;
      }
    });
  }
  

  constructor(private http: HttpClient, private router: Router) {}

  
  //sidebar
  toggleSidebar(){
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  showSection(section:'balance' | 'status' | 'history' | 'rules') {
    this.visibleSection = section;
  }




  //apis
  
  fetchLeaveBalance() {
    this.http.get<any>(`http://localhost:5000/leave_balance/${this.userId}`).subscribe({
      next: (data) => {
        this.leaves = {
          casual: data.casual_leave,
          sick: data.sick_leave,
          earned: data.earned_leave,
          unpaid: data.unpaid_leave
        };
      },
      error: (error) => {
        console.error('Error fetching leave balance:', error);
      },
      complete: () => {
        console.log('Leave balance fetch complete');
      }
    });
  }
  
  fetchLeaveHistory() {
    this.http.get<any>(`http://localhost:5000/leave_history/${this.userId}`).subscribe({
      next: (data) => {
        this.leaveHistory = Array.isArray(data) ? data : [data];
        alert('Fetched leave history!');
      },
      error: (error) => {
        console.error('Error fetching leave history:', error);
        this.leaveHistory = [];
      },
      complete: () => {
        console.log('Leave history fetch complete');
      }
    });
  }
  

  fetchLeaveStatus() {
    this.http.get<any>(`http://localhost:5000/last_leave_status/${this.userId}`).subscribe({
      next: (data) => {
        this.leaveStatus = `Your last leave request is: ${data.status}`;
      },
      error: (error) => {
        console.error('Error fetching leave status:', error);
      },
      complete: () => {
        console.log('Leave status fetch complete');
      }
    });
  }
  

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    this.router.navigate(['/']);
  }

  navigateToApplyLeave() {
    this.router.navigate(['/apply-leave']);
  }
  
 
}



  