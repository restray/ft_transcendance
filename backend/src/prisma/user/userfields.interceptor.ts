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
  if (theObject instanceof Array) {
    for (let i = 0; i < theObject.length; i++) {
      theObject[i] = getObject(theObject[i]);
    }
  } else {
    for (const prop in theObject) {
      if (prop == 'avatar') {
        theObject[prop] = localUploadToURL(theObject[prop]);
        continue;
      }
      if (prop in ['password', 'otp_secret']) {
        delete theObject[prop];
        continue;
      }
      if (
        theObject[prop] instanceof Object ||
        theObject[prop] instanceof Array
      ) {
        result[prop] = getObject(theObject[prop]);
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
        data = getObject(data);
        return data;
      }),
    );
  }
}
