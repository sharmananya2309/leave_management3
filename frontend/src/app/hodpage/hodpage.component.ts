import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger,state,style,transition,animate, animation } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CalenderComponent } from '../calender/calender.component';
@Component({
  selector: 'app-hodpage',
  standalone:true,
  imports: [CommonModule,InfiniteScrollDirective,CalenderComponent],
  templateUrl: './hodpage.component.html',
  styleUrl: './hodpage.component.scss',
  animations: [
    trigger('slideSidebar', [
      state('open', style({ transform: 'translateX(-100%)' })),
      state('closed', style({ transform: 'translateX(0)' })),
      transition('open <=> closed', [animate('0.3s ease-in-out')]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HodpageComponent implements OnInit {
  leaveRequests: any[] = [];
  staffList: any[] = [];
  selectedRequest: any = null;
  hodName = localStorage.getItem('name') || 'HOD';
  profilePicUrl = '';
  sidebarOpen = true;
  holidays:any[]=[];
  page = 0;
  loading = false;
  selectedSection: 'staff' | 'requests' = 'staff';
  department = localStorage.getItem('department') || '';
  today: Date = new Date();
  activeTab: string = 'pending';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const storedHod = localStorage.getItem('name');
    if (storedHod) {
      this.hodName = storedHod;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Check if profile image exists and set accordingly
      if (userData.profile_image) {
        this.profilePicUrl = `http://localhost:5000/${userData.profile_image}`;
      }
    
    }
    this.department = localStorage.getItem('department') || '';

  if (this.department) {
    this.fetchStaff();
    this.fetchLeaveRequests(this.activeTab);
  } else {
    console.error('Department not set, cannot fetch staff or leave requests.');}

    this.loadMoreHolidays();
    this.fetchStaff();
    this.fetchLeaveRequests(this.activeTab);
    
   
  }

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
  

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  selectSection(section: 'staff' | 'requests') {
    this.selectedSection = section;
    if (section === 'staff') {
      this.fetchStaff();
    } else {
      this.fetchLeaveRequests(this.activeTab);
    }
  }

changeTab(tab: string) {
  this.activeTab = tab;
  this.fetchLeaveRequests(tab);
} 

get activeTabTitle() {
  switch (this.activeTab) {
    case 'pending': return 'Pending Requests';
    case 'Approved/Rejected': return 'Approved/Rejected';
    case 'history': return 'Request History';
    default: return '';
  }
} 
//api
fetchStaff() {
  if (!this.department) {
    console.error('Department not set, cannot fetch staff.');
    return;
  }
  this.http.get<any[]>(`http://localhost:5000/staff_by_dept/${this.department}`).subscribe({
    next: (data) => {
      this.staffList = data;  
      console.log(this.staffList);
    },
    error: (err) => console.error('Failed to fetch staff:', err)
  });
}

  fetchLeaveRequests(tab: string) {
    let url = 'http://localhost:5000/leave_requests';
   

    if (tab === 'Approved/Rejected') {
      url = `http://localhost:5000/approved-rejected?dept=${this.department}`;
    } else if (tab === 'history') {
      url = `http://localhost:5000/leave-history?dept=${this.department}`;
    }
    if (tab === 'pending') {
      url += `?dept=${this.department}`; 
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => this.leaveRequests = data,
      error: (err) => console.error('Error fetching leave requests:', err)
    });
  }
 
  handleLogout() {
    localStorage.removeItem('hodtoken');
    localStorage.removeItem('name');
    this.router.navigate(['/']);
  }

  handleReqClick(request: any) {
    this.http.get<any>(`http://localhost:5000/leave_requests/${request.id}`).subscribe({
      next: (response) => {
        this.selectedRequest = { ...request, ...response };
      },
      error: (err) => console.error('Error fetching leave details:', err)
    });
  }
  closeModel() {
    this.selectedRequest = null;
  }

  handleLeaveAction(request: any, status: string) {
    if (!request) return;

    this.http.put(`http://localhost:5000/update_leaves_status/${request.id}`, {
      status: status,
      userId: request.user_id,
      leavetype: request.leave_type
    }).subscribe({
      next: () => {
        this.leaveRequests = this.leaveRequests.map(req =>
          req.id === request.id ? { ...req, status: status } : req
        );
        this.closeModel();
      },
      error: (err) => console.error('Error updating leave request:', err)
    });
  }
}

//alternate of handle leave action
// approveReject(request: any, status: string) {
//   this.http.put(`http://localhost:5000/update_leaves_status/${request.id}`, {
//     status,
//     userId: request.user_id,
//     leavetype: request.leave_type
//   }).subscribe({
//     next: () => this.fetchLeaveRequests(this.activeTab),
//     error: (err) => console.error('Error approving/rejecting leave:', err)
//   });
// }