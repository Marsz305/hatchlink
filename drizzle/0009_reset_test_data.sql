-- End-of-pilot reset requested by the platform owner.
-- Administrator authorization is intentionally preserved in admin_users.
DELETE FROM `claims`;
DELETE FROM `receipts`;
DELETE FROM `payments`;
DELETE FROM `orders`;
DELETE FROM `inspections`;
DELETE FROM `demand_requests`;
DELETE FROM `support_messages`;
DELETE FROM `notifications`;
DELETE FROM `listings`;
DELETE FROM `accounts`;
