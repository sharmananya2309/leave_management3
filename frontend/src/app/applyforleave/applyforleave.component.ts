import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-applyforleave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applyforleave.component.html',
  styleUrl: './applyforleave.component.scss'
})
export class ApplyforleaveComponent {
  leaveType = '';
  startDate = '';
  endDate = '';
  reason = '';
  error = '';
  leaveBalance: any = {};
  userId = localStorage.getItem('user_id') || '1';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any>(`http://localhost:5000/leave_balance/${this.userId}`)
      .subscribe({
        next: (data) => this.leaveBalance = data,
        error: (err) => console.error('Error fetching leave balance:', err)
      });
  }

  onSubmit() {
    if (!this.leaveType || !this.startDate || !this.endDate || !this.reason) {
      this.error = 'Please fill all fields!';
      return;
    }

    const leaveData = {
      userId: this.userId,
      leavetype: this.leaveType,
      startdate: this.startDate,
      enddate: this.endDate,
      reason: this.reason
    };

    this.http.post<any>('http://localhost:5000/apply_leave', leaveData)
      .subscribe({
        next: (res) => {
          if (res.message === "Leave Request Submitted") {
            alert(`Leave request submitted for ${this.leaveType}. Pending approval.`);
            this.router.navigate(['/staff']);
          } else {
            alert(res.message);
          }
        },
        error: (err) => {
          console.error('Error submitting leave request:', err);
          alert('An error occurred while submitting your request.');
        }
      });
  }
}
