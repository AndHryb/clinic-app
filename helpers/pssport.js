import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { injector } from '../injector.js';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_KEY,
};

export default function checkToken(passport) {
  passport.use(
    new Strategy(options, async (payload, done) => {
      try {
        const user = await injector.userService.getByUserId(payload.userId);

        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (err) {
        console.log(`Passport error :${err.name} : ${err.message}`);
      }
    }),
  );
}
