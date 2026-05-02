import { StyleSheet } from '@react-pdf/renderer'

// Use the built-in Times-Roman family from @react-pdf/renderer.
// (Custom font registration was removed because shipping TTF files in
// /public/fonts/ adds asset complexity without a meaningful visual gain
// for an LTR Latin contract.)

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    paddingTop: 43.2,
    paddingBottom: 60,
    paddingLeft: 43.2,
    paddingRight: 43.2,
    lineHeight: 1.4,
    color: '#000000',
  },
  logo: {
    maxHeight: 80,
    objectFit: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Times-Italic',
    textAlign: 'center',
    marginBottom: 18,
    color: '#444444',
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  paragraph: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Times-Bold',
  },
  italic: {
    fontFamily: 'Times-Italic',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 36,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 4,
    height: 30,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#444444',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 43.2,
    right: 43.2,
    textAlign: 'center',
    fontSize: 9,
    color: '#888888',
    borderTopWidth: 0.5,
    borderTopColor: '#cccccc',
    paddingTop: 6,
  },
  disclaimer: {
    fontSize: 9,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Times-Italic',
  },
  table: {
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#cccccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 11,
    textAlign: 'right',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Times-Bold',
  },
})
