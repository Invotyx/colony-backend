
## Factory

```sh
 GET /api/factory?klass=UserFactory&param={"expect":10}
```

## Seeder

```sh
 GET /api/seed?klass=RolesSeed&up=1
```

## APIs

```sh
  TEST URL          GET   /api/app
  SEED VALUES       GET   /api/seed
  GET AuthToken     GET   /api/token

  LOGIN             POST  /api/auth/login
  PROFILE           GET   /api/auth/profile
  FORGOT PASSWORD   POST  /api/auth/forgetPassword
  TOKEN FOR AUTH    POST  /api/auth/user-tfa
  RESET PASSWORD    POST  /api/auth/reset
  UPDATE PROFILE    POST  /api/auth/:id/updateUserProfile
  UPDATE PROFILE    POST  /api/auth/:id/updateProfile

  GET USERS         GET   /api/users
  GET USERBYID      GET   /api/users/:id
  GET USERROLES     GET   /api/users/roles
  ASSIGN USERROLE   POST  /api/users/:id/roleId
  ADD MULTIPLEUSERS POST  /api/users
  UPDATE USER       POST  /api/users/:id/update
  UPDATE ROLE       POST  /api/users/:id/updateRole
  UPDATE PASSWORD   POST  /api/users/:userId/updatePwd
  UPDATE ProfilePic POST  /api/users/:id/upPic
  GET SINGLE USER   GET   /api/users/:id
```
