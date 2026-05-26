import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type OrderConfirmationProps = {
  storeName: string;
  orderId: string;
  customerName: string;
  shipping: {
    address1: string;
    address2?: string | null;
    city: string;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  items: Array<{
    name: string;
    size?: string | null;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency?: string;
  supportEmail?: string;
};

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default function OrderConfirmation({
  storeName,
  orderId,
  customerName,
  shipping,
  items,
  totalAmount,
  currency = "USD",
  supportEmail,
}: OrderConfirmationProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();
  return (
    <Html>
      <Head />
      <Preview>{`Your ${storeName} order ${shortId} is confirmed`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Thanks for your order, {customerName}.</Heading>
          <Text style={paragraphStyle}>
            We received your order <strong>#{shortId}</strong> and we&apos;re getting it ready. You&apos;ll
            receive another email when it ships.
          </Text>

          <Section style={sectionStyle}>
            <Heading as="h2" style={subheadingStyle}>
              Items
            </Heading>
            {items.map((item, i) => (
              <Text key={i} style={lineItemStyle}>
                {item.quantity} × {item.name}
                {item.size ? ` (${item.size})` : ""} — {formatMoney(item.price * item.quantity, currency)}
              </Text>
            ))}
          </Section>

          <Hr style={hrStyle} />

          <Text style={totalStyle}>
            <strong>Total: {formatMoney(totalAmount, currency)}</strong>
          </Text>

          <Section style={sectionStyle}>
            <Heading as="h2" style={subheadingStyle}>
              Shipping to
            </Heading>
            <Text style={paragraphStyle}>
              {customerName}
              <br />
              {shipping.address1}
              {shipping.address2 ? (
                <>
                  <br />
                  {shipping.address2}
                </>
              ) : null}
              <br />
              {shipping.city}
              {shipping.state ? `, ${shipping.state}` : ""}
              {shipping.postalCode ? ` ${shipping.postalCode}` : ""}
              <br />
              {shipping.country}
            </Text>
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            Need help? Reply to this email{supportEmail ? ` or write us at ${supportEmail}` : ""}.
          </Text>
          <Text style={footerStyle}>— {storeName}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = { backgroundColor: "#f6f6f6", fontFamily: "Helvetica, Arial, sans-serif" } as const;
const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "32px",
  maxWidth: "560px",
  borderRadius: "8px",
} as const;
const headingStyle = { fontSize: "22px", margin: "0 0 16px 0", color: "#111" } as const;
const subheadingStyle = { fontSize: "16px", margin: "16px 0 8px 0", color: "#111" } as const;
const sectionStyle = { margin: "16px 0" } as const;
const paragraphStyle = { fontSize: "14px", lineHeight: "22px", color: "#333" } as const;
const lineItemStyle = { fontSize: "14px", lineHeight: "22px", color: "#333", margin: "4px 0" } as const;
const totalStyle = { fontSize: "16px", color: "#111", textAlign: "right" } as const;
const hrStyle = { borderColor: "#e6e6e6", margin: "20px 0" } as const;
const footerStyle = { fontSize: "12px", color: "#777", margin: "8px 0" } as const;
