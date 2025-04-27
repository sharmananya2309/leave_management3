import { Routes } from '@angular/router';
import { LoginpageComponent } from './loginpage/loginpage.component';
import { StaffpageComponent } from './staffpage/staffpage.component';
import { ApplyforleaveComponent } from './applyforleave/applyforleave.component';
import { HodpageComponent } from './hodpage/hodpage.component';
import { RegisterpageComponent } from './registerpage/registerpage.component';
import { authGuard } from './auth.guard';
import { MainpageComponent } from './mainpage/mainpage.component';
export const routes: Routes = [
    { path: '', component: MainpageComponent },
    { path: 'login', component: LoginpageComponent },
     {path:'register',component:RegisterpageComponent},
    { path: 'staff', component: StaffpageComponent, },
    { path: 'apply-leave', component: ApplyforleaveComponent },
    {path:'hod',component:HodpageComponent,},
    { path: '**', redirectTo: '', pathMatch: 'full' },

];
canActivate:[authGuard]