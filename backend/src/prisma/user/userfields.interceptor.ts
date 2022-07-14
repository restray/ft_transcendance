import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { localUploadToURL } from './user.service';

function getObject(theObject) {
  const result = theObject;
  if (result instanceof Array) {
    for (let i = 0; i < result.length; i++) {
      result[i] = getObject(result[i]);
    }
  } else {
    for (const prop in result) {
      if (prop == 'avatar') {
        result[prop] = localUploadToURL(result[prop]);
        continue;
      }
      if (['password', 'otp_secret'].includes(prop)) {
        delete result[prop];
        continue;
      }
      if (result[prop] instanceof Object || result[prop] instanceof Array) {
        result[prop] = getObject(result[prop]);
      }
    }
  }
  return result;
}

@Injectable()
export class UserfieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return getObject(data);
      }),
    );
  }
}
