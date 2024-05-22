import os
import hashlib


def hash_password_with_salt(password: str):
    salt = os.urandom(16)
    salted_password = password.encode("utf-8") + salt
    hash_obj = hashlib.sha256(salted_password)
    password_hash = hash_obj.hexdigest()
    salt_and_hash = salt.hex() + password_hash
    return salt_and_hash


def verify_password(stored_password: str, provided_password: str) -> bool:
    # Extract the salt from the stored password
    salt = bytes.fromhex(stored_password[:32])
    # Extract the hash from the stored password
    stored_hash = stored_password[32:]
    # Combine the provided password with the extracted salt
    salted_password = provided_password.encode("utf-8") + salt
    # Hash the salted password
    hash_obj = hashlib.sha256(salted_password)
    # Get the hexadecimal representation of the hash
    provided_hash = hash_obj.hexdigest()
    # Compare the provided hash with the stored hash
    return stored_hash == provided_hash
