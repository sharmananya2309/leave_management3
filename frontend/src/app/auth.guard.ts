import { CanActivateFn,Router } from '@angular/router';
import { inject } from '@angular/core';


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('role'); // stored as 'HOD' or 'Staff'

  if (role === 'HOD' || role === 'Staff') {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
