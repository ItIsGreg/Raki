from typing import Union

from pydantic import BaseModel


class ProfileBase(BaseModel):
    name: str
    content: dict


class ProfileCreate(ProfileBase):
    pass


class Profile(ProfileBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    profiles: list[Profile]

    class Config:
        orm_mode = True
